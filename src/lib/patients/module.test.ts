import "fake-indexeddb/auto";

import assert from "node:assert/strict";
import {test, type TestContext} from "node:test";

import {PatientDatabase} from "./local";
import {createPatients, type PatientRemote} from "./module";

import {patientDraftSchema, type Patient, type PatientDraft} from "@/types/Patient";

const draft: PatientDraft = {
  full_name: "Paciente de prueba",
  email: "",
  phone_number: "",
  gender: "other",
  dob: "2000-01-01",
  notes: "Historia inicial",
  health_insurance: "",
};

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });

  return {promise, resolve};
}

function setup(t: TestContext) {
  const local = new PatientDatabase(crypto.randomUUID());
  const records = new Map<string, Patient>();
  let online = false;
  let writes = 0;
  let reads = 0;
  const remote: PatientRemote = {
    async list() {
      reads++;

      return [...records.values()];
    },
    async save(patient) {
      writes++;
      records.set(patient.id, patient);
    },
    async remove(id) {
      writes++;
      records.delete(id);
    },
  };
  const module = createPatients({local, remote, online: () => online, exclusive: (run) => run()});

  t.after(async () => {
    await module.sync();
    await local.delete();
  });

  return {
    local,
    remote,
    records,
    module,
    connect: () => {
      online = true;
    },
    disconnect: () => {
      online = false;
    },
    writes: () => writes,
    reads: () => reads,
  };
}

test("offline saves survive reopening and synchronize on reconnect", async (t) => {
  const env = setup(t);
  const patient = await env.module.save(draft);

  assert.equal(env.module.getSnapshot().pendingCount, 1);
  assert.deepEqual(env.module.getSnapshot().patients, [patient]);
  env.local.close();
  await env.local.open();
  assert.deepEqual(await env.local.patients.get(patient.id), patient);
  env.connect();
  await env.module.sync();
  assert.deepEqual(env.records.get(patient.id), patient);
  assert.equal(env.module.getSnapshot().pendingCount, 0);
  assert.ok(env.module.getSnapshot().lastSyncTime);
});

test("remote reads never enqueue writes; repeated sync is idempotent", async (t) => {
  const env = setup(t);
  const patient = {...draft, id: crypto.randomUUID()};

  env.records.set(patient.id, patient);
  env.connect();
  await env.module.sync();
  await env.module.sync();
  assert.equal(env.writes(), 0);
  assert.equal(env.module.getSnapshot().pendingCount, 0);
  assert.deepEqual(env.module.getSnapshot().patients, [patient]);
});

test("cache and outbox roll back together when queue persistence fails", async (t) => {
  const env = setup(t);

  env.local.pending.hook("creating", () => {
    throw new Error("disk full");
  });
  await assert.rejects(env.module.save(draft), /disk full/);
  assert.equal(await env.local.patients.count(), 0);
  assert.equal(await env.local.pending.count(), 0);
});

test("failed pushes retain edits, skip pull and do not claim successful sync", async (t) => {
  const env = setup(t);
  const patient = await env.module.save({...draft, notes: "Edición offline"});

  env.records.set(patient.id, {...patient, notes: "Versión anterior"});
  env.remote.save = async () => {
    throw new Error("permission denied");
  };
  env.connect();
  await env.module.sync();
  assert.equal(env.reads(), 0);
  assert.equal(env.module.getSnapshot().patients[0].notes, "Edición offline");
  assert.equal(env.module.getSnapshot().pendingCount, 1);
  assert.equal(env.module.getSnapshot().lastSyncTime, null);
  assert.equal(env.module.getSnapshot().error, "permission denied");
});

test("concurrent sync callers share the same execution", async (t) => {
  const env = setup(t);

  await env.module.save(draft);
  const entered = deferred();
  const release = deferred();
  let writes = 0;

  env.remote.save = async (patient) => {
    writes++;
    entered.resolve();
    await release.promise;
    env.records.set(patient.id, patient);
  };
  env.connect();
  const first = env.module.sync();

  await entered.promise;
  const second = env.module.sync();

  assert.equal(first, second);
  release.resolve();
  await Promise.all([first, second]);
  assert.equal(writes, 1);
});

test("an edit during an in-flight save is not acknowledged by the older response", async (t) => {
  const env = setup(t);
  const original = await env.module.save(draft);
  const entered = deferred();
  const release = deferred();
  const sentNotes: string[] = [];

  env.remote.save = async (patient) => {
    sentNotes.push(patient.notes);
    if (sentNotes.length === 1) {
      entered.resolve();
      await release.promise;
    }
    env.records.set(patient.id, patient);
  };
  env.connect();
  const sync = env.module.sync();

  await entered.promise;
  const latest = await env.module.save({...draft, notes: "Nueva edición"}, original.id);

  release.resolve();
  await sync;
  assert.deepEqual(sentNotes, [draft.notes, "Nueva edición"]);
  assert.deepEqual(env.records.get(original.id), latest);
  assert.equal(env.module.getSnapshot().pendingCount, 0);
});

test("an edit arriving during a remote read wins over the downloaded value", async (t) => {
  const env = setup(t);
  const patient = {...draft, id: crypto.randomUUID()};

  env.records.set(patient.id, patient);
  const entered = deferred();
  const release = deferred();
  let firstRead = true;

  env.remote.list = async () => {
    const result = [...env.records.values()];

    if (firstRead) {
      firstRead = false;
      entered.resolve();
      await release.promise;
    }

    return result;
  };
  env.connect();
  const sync = env.module.sync();

  await entered.promise;
  const latest = await env.module.save({...draft, notes: "No sobrescribir"}, patient.id);

  release.resolve();
  await sync;
  assert.deepEqual(env.module.getSnapshot().patients, [latest]);
  assert.deepEqual(env.records.get(patient.id), latest);
});

test("offline deletes remain deleted when the next remote read contains an old row", async (t) => {
  const env = setup(t);
  const patient = await env.module.save(draft);

  env.records.set(patient.id, patient);
  await env.module.remove(patient.id);
  env.remote.remove = async () => {
    throw new Error("network failure");
  };
  env.connect();
  await env.module.sync();
  assert.deepEqual(env.module.getSnapshot().patients, []);
  assert.equal(env.module.getSnapshot().pendingCount, 1);
  env.remote.remove = async (id) => {
    env.records.delete(id);
  };
  await env.module.sync();
  assert.equal(env.records.size, 0);
  assert.equal(env.module.getSnapshot().pendingCount, 0);
});

test("remote deletions remove clean cached rows", async (t) => {
  const env = setup(t);
  const patient = await env.module.save(draft);

  env.connect();
  await env.module.sync();
  env.records.delete(patient.id);
  await env.module.sync();
  assert.deepEqual(env.module.getSnapshot().patients, []);
});

test("clearing cache preserves unsent edits and deletes", async (t) => {
  const env = setup(t);
  const clean = {...draft, id: crypto.randomUUID()};

  env.records.set(clean.id, clean);
  env.connect();
  await env.module.sync();
  env.disconnect();
  const dirty = await env.module.save({...draft, notes: "Pendiente"});
  const removed = await env.module.save(draft);

  await env.module.remove(removed.id);
  await env.module.clearCache();
  assert.deepEqual(env.module.getSnapshot().patients, [dirty]);
  assert.equal(env.module.getSnapshot().pendingCount, 2);
});

test("accounts have separate caches and pending changes", async (t) => {
  const first = setup(t);
  const second = setup(t);
  const patient = await first.module.save(draft);

  second.connect();
  await second.module.sync();
  assert.deepEqual(second.module.getSnapshot().patients, []);
  assert.equal(second.module.getSnapshot().pendingCount, 0);
  assert.equal(await second.local.patients.get(patient.id), undefined);
  assert.equal(first.module.getSnapshot().pendingCount, 1);
});

test("invalid drafts and ids are rejected before persistence", async (t) => {
  const env = setup(t);

  await assert.rejects(env.module.save({...draft, full_name: "  "}));
  await assert.rejects(env.module.save(draft, "not-an-id"));
  await assert.rejects(env.module.remove("not-an-id"));
  assert.equal(await env.local.patients.count(), 0);
  assert.equal(await env.local.pending.count(), 0);
  assert.equal(patientDraftSchema.safeParse({...draft, email: "bad"}).success, false);
});
