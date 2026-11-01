import {liveQuery} from "dexie";

import {PatientDatabase} from "./local";
import {PatientSyncError, syncErrorMessage} from "./errors";

import {patientSchema, type Patient, type PatientDraft} from "@/types/Patient";

export interface PatientRemote {
  list(): Promise<Patient[]>;
  save(patient: Patient): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface PatientSnapshot {
  patients: Patient[];
  ready: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  error: string | null;
  lastSyncTime: Date | null;
}

export const initialSnapshot: PatientSnapshot = {
  patients: [],
  ready: false,
  isOnline: false,
  isSyncing: false,
  pendingCount: 0,
  error: null,
  lastSyncTime: null,
};

type Options = {
  local: PatientDatabase;
  remote: PatientRemote;
  online: () => boolean;
  exclusive: (run: () => Promise<void>) => Promise<void>;
};

export function createPatients({local, remote, online, exclusive}: Options) {
  let snapshot = {...initialSnapshot};
  let syncing: Promise<void> | null = null;
  let stopped = false;
  const listeners = new Set<() => void>();

  const publish = (patch: Partial<PatientSnapshot>) => {
    if (stopped) return;
    snapshot = {...snapshot, ...patch};
    listeners.forEach((listener) => listener());
  };

  const refresh = async () => {
    const [patients, pendingCount] = await Promise.all([
      local.patients.orderBy("full_name").toArray(),
      local.pending.count(),
    ]);

    publish({patients, pendingCount, ready: true});
  };

  const sync = (): Promise<void> => {
    if (syncing) return syncing;
    publish({isOnline: online()});
    if (stopped || !online()) return Promise.resolve();

    publish({isSyncing: true, error: null});
    syncing = exclusive(async () => {
      if (stopped) return;
      do {
        // Stop before pulling when a write fails; preserve unsent edits and tombstones.
        for (const change of await local.pending.toArray()) {
          if (stopped || !online()) return;
          if (change.kind === "save") await remote.save(change.patient);
          else await remote.remove(change.id);
          await local.acknowledge(change);
        }
        if (stopped || !online()) return;
        const patients = await remote.list();

        if (stopped) return;
        await local.mergeRemote(patients);
        await refresh();
      } while (!stopped && online() && (await local.pending.count()) > 0);
      publish({lastSyncTime: new Date()});
    })
      .catch((error: unknown) => {
        publish({error: syncErrorMessage(error)});
      })
      .finally(() => {
        syncing = null;
        publish({isSyncing: false, isOnline: online()});
      });

    return syncing;
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      stopped = false;
      const observation = liveQuery(async () => ({
        patients: await local.patients.orderBy("full_name").toArray(),
        pendingCount: await local.pending.count(),
      })).subscribe({
        next: (data) => publish({...data, ready: true}),
        error: () =>
          publish({
            ready: true,
            error: new PatientSyncError("local").message,
          }),
      });
      const onOnline = () => {
        void sync();
      };
      const onOffline = () => publish({isOnline: false});

      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      const interval = window.setInterval(onOnline, 5 * 60 * 1000);

      void sync();

      return () => {
        stopped = true;
        observation.unsubscribe();
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
        window.clearInterval(interval);
        void (syncing ?? Promise.resolve()).finally(() => {
          if (stopped) local.close();
        });
      };
    },
    async save(draft: PatientDraft, id?: string) {
      if (stopped) throw new Error("La sesión cambió. Volvé a abrir la ficha.");
      const patient = patientSchema.parse({...draft, id: id ?? crypto.randomUUID()});

      await local.save(patient);
      await refresh();
      void sync();

      return patient;
    },
    async remove(id: string) {
      if (stopped) throw new Error("La sesión cambió. Volvé a abrir la ficha.");
      patientSchema.shape.id.parse(id);
      await local.remove(id);
      await refresh();
      void sync();
    },
    sync,
    async clearCache() {
      if (stopped) throw new Error("La sesión cambió. Volvé a abrir la página.");
      await exclusive(async () => {
        await local.clearCache();
        await refresh();
      });
    },
  };
}

export type Patients = ReturnType<typeof createPatients>;
