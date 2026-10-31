import "fake-indexeddb/auto";

import type {Patient} from "@/types/Patient";

import assert from "node:assert/strict";
import {test} from "node:test";

import {PatientDatabase} from "./local";
import {createPatients} from "./module";

test("offline startup reads durable cache and stopping rejects stale actions", async (t) => {
  const browser = Object.assign(new EventTarget(), {setInterval, clearInterval});

  Object.defineProperty(globalThis, "window", {value: browser, configurable: true});
  const local = new PatientDatabase(crypto.randomUUID());
  const patient: Patient = {
    id: crypto.randomUUID(),
    full_name: "Paciente local",
    email: "",
    phone_number: "",
    gender: "",
    dob: "",
    notes: "Persistido",
    health_insurance: "",
  };

  await local.patients.put(patient);
  let requests = 0;
  const module = createPatients({
    local,
    online: () => false,
    exclusive: (run) => run(),
    remote: {
      async list() {
        requests++;

        return [];
      },
      async save() {
        requests++;
      },
      async remove() {
        requests++;
      },
    },
  });
  const ready = new Promise<void>((resolve) => {
    const unsubscribe = module.subscribe(() => {
      if (module.getSnapshot().ready) {
        unsubscribe();
        resolve();
      }
    });
  });
  const stop = module.start();

  t.after(async () => {
    stop();
    await module.sync();
    await local.delete();
    Reflect.deleteProperty(globalThis, "window");
  });
  await ready;
  assert.deepEqual(module.getSnapshot().patients, [patient]);
  assert.equal(requests, 0);
  stop();
  await assert.rejects(module.remove(patient.id), /sesión cambió/);
  await assert.rejects(module.clearCache(), /sesión cambió/);
  browser.dispatchEvent(new Event("online"));
  await module.sync();
  assert.equal(requests, 0);
});

test("unmounting during a request stops pull and does not leak updates to observers", async (t) => {
  const browser = Object.assign(new EventTarget(), {setInterval, clearInterval});

  Object.defineProperty(globalThis, "window", {value: browser, configurable: true});
  const local = new PatientDatabase(crypto.randomUUID());
  let resolveRequest = () => {};
  let enteredRequest = () => {};
  const request = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    enteredRequest = resolve;
  });
  let online = false;
  let reads = 0;
  const module = createPatients({
    local,
    online: () => online,
    exclusive: (run) => run(),
    remote: {
      async list() {
        reads++;

        return [];
      },
      async save() {
        enteredRequest();
        await request;
      },
      async remove() {},
    },
  });

  await module.save({
    full_name: "Paciente",
    email: "",
    phone_number: "",
    gender: "",
    dob: "",
    notes: "",
    health_insurance: "",
  });
  online = true;
  const stop = module.start();

  t.after(async () => {
    stop();
    await module.sync();
    await local.delete();
    Reflect.deleteProperty(globalThis, "window");
  });
  const sync = module.sync();

  await entered;
  stop();
  const stoppedSnapshot = module.getSnapshot();

  resolveRequest();
  await sync;
  assert.equal(reads, 0);
  assert.equal(module.getSnapshot(), stoppedSnapshot);
});
