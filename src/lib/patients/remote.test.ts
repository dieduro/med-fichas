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

function setup(fetch: typeof globalThis.fetch) {
  const client = createClient("https://patients.example.test", "public-test-key", {
    global: {fetch},
    auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
  });

  client.auth.getUser = async () => ({
    data: {
      user: {
        id: userId,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2026-01-01",
      },
    },
    error: null,
  });

  return {client, remote: patientRemote(client, userId)};
}

test("remote reads filter by owner and paginate until empty, normalizing nullable columns", async () => {
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
  assert.ok(requests.every((url) => url.searchParams.get("user_id") === `eq.${userId}`));
  assert.equal(requests[1].searchParams.get("id"), `gt.${patient.id}`);
});

test("remote saves use the authenticated owner and require confirmation", async () => {
  let body: unknown;
  const {remote} = setup(async (_input, init) => {
    body = JSON.parse(String(init?.body));

    return Response.json({id: patient.id});
  });

  await remote.save(patient);
  assert.deepEqual(body, {...patient, dob: null, user_id: userId});
  const denied = setup(async () => Response.json(null));

  await assert.rejects(denied.remote.save(patient), /no confirmó/);
});

test("remote deletes filter both patient and owner", async () => {
  let requested = "";
  const {remote} = setup(async (input) => {
    requested = String(input);

    return new Response(null, {status: 204});
  });

  await remote.remove(patient.id);
  const url = new URL(requested);

  assert.equal(url.searchParams.get("id"), `eq.${patient.id}`);
  assert.equal(url.searchParams.get("user_id"), `eq.${userId}`);
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
