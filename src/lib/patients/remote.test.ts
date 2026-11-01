import type {Patient} from "@/types/Patient";

import assert from "node:assert/strict";
import {test} from "node:test";

import {createClient} from "@supabase/supabase-js";

import {patientRemote} from "./remote";

const userId = crypto.randomUUID();
const patient: Patient = {
  id: crypto.randomUUID(),
  full_name: "Paciente de prueba",
  email: "",
  phone_number: "",
  gender: "other",
  dob: "",
  notes: "",
  health_insurance: "",
};

function setup(fetch: typeof globalThis.fetch, accountId = userId) {
  const client = createClient("https://patients.example.test", "public-test-key", {
    global: {fetch},
    auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
  });

  client.auth.getUser = async () => ({
    data: {
      user: {
        id: accountId,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2026-01-01",
      },
    },
    error: null,
  });

  return {client, remote: patientRemote(client, accountId)};
}

test("shared remote reads paginate until empty, normalizing nullable columns", async () => {
  const requests: URL[] = [];
  const {remote} = setup(async (input) => {
    const url = new URL(String(input));

    requests.push(url);
    const rows =
      requests.length === 1
        ? [{...patient, notes: null, dob: null, health_insurance: null, age: 42, user_id: userId}]
        : [];

    return Response.json(rows);
  });

  assert.deepEqual(await remote.list(), [patient]);
  assert.equal(requests.length, 2);
  assert.ok(requests.every((url) => !url.searchParams.has("user_id")));
  assert.equal(requests[1].searchParams.get("id"), `gt.${patient.id}`);
});

test("remote saves retain the shared system marker and require confirmation", async () => {
  let body: unknown;
  const {remote} = setup(async (_input, init) => {
    body = JSON.parse(String(init?.body));

    return Response.json({id: patient.id});
  });

  await remote.save(patient);
  assert.deepEqual(body, {...patient, dob: null, user_id: "system"});
  const denied = setup(async () => Response.json(null));

  await assert.rejects(denied.remote.save(patient), /no confirmó/);
});

test("authenticated accounts can delete a shared patient by id", async () => {
  let requested = "";
  const {remote} = setup(async (input) => {
    requested = String(input);

    return new Response(null, {status: 204});
  });

  await remote.remove(patient.id);
  const url = new URL(requested);

  assert.equal(url.searchParams.get("id"), `eq.${patient.id}`);
  assert.equal(url.searchParams.has("user_id"), false);
});

test("a changed or expired session cannot send requests for the previous account", async () => {
  let requests = 0;
  const {client, remote} = setup(async () => {
    requests++;

    return Response.json([]);
  });

  client.auth.getUser = async () => ({
    data: {
      user: {
        id: crypto.randomUUID(),
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2026-01-01",
      },
    },
    error: null,
  });
  await assert.rejects(remote.list(), /Iniciá sesión/);
  await assert.rejects(remote.save(patient), /Iniciá sesión/);
  await assert.rejects(remote.remove(patient.id), /Iniciá sesión/);
  assert.equal(requests, 0);
});

test("malformed responses and transport errors cannot become an empty successful snapshot", async () => {
  const malformed = setup(async () => Response.json([{...patient, id: "invalid"}]));

  await assert.rejects(malformed.remote.list());
  const failed = setup(async () =>
    Response.json({message: "permission denied", code: "42501"}, {status: 403}),
  );

  await assert.rejects(failed.remote.list(), /permission denied/);
});

test("patients already readable in the database are not silently hidden after upgrading", async () => {
  const legacy = {...patient, user_id: "system"};
  const {remote} = setup(async (input) => {
    const url = new URL(String(input));
    // The transport models a legacy row already authorized by the database's RLS.
    const filter = url.searchParams.get("user_id");
    const rows = !url.searchParams.has("id") && (!filter || filter === "eq.system") ? [legacy] : [];

    return Response.json(rows);
  });
  const rows = await remote.list();

  assert.equal(rows.length, 1, "the existing patient disappeared from the authenticated list");
});

test("different authenticated accounts see the same historical and recent patients", async () => {
  const shared = [
    {...patient, user_id: "system"},
    {...patient, id: crypto.randomUUID(), user_id: null},
    {...patient, id: crypto.randomUUID(), user_id: userId},
  ];
  const transport: typeof globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    const filter = url.searchParams.get("user_id");

    return Response.json(
      url.searchParams.has("id")
        ? []
        : shared.filter((row) => !filter || filter === `eq.${row.user_id}`),
    );
  };
  const first = setup(transport);
  const second = setup(transport, crypto.randomUUID());
  const expected = shared.map(({user_id: _owner, ...record}) => record);

  assert.deepEqual(await first.remote.list(), expected);
  assert.deepEqual(await second.remote.list(), expected);
});

test("anonymous requests cannot read, save or delete shared patients", async () => {
  let requests = 0;
  const client = createClient("https://patients.example.test", "public-test-key", {
    global: {
      fetch: async () => {
        requests++;

        return Response.json([]);
      },
    },
    auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
  });
  const remote = patientRemote(client, userId);

  await assert.rejects(remote.list(), /Iniciá sesión/);
  await assert.rejects(remote.save(patient), /Iniciá sesión/);
  await assert.rejects(remote.remove(patient.id), /Iniciá sesión/);
  assert.equal(requests, 0);
});
