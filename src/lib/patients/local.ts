import type {Patient} from "@/types/Patient";

import Dexie, {type Table} from "dexie";

type PendingChange = {id: string; revision: string} & (
  | {kind: "save"; patient: Patient}
  | {kind: "delete"}
);

export class PatientDatabase extends Dexie {
  patients!: Table<Patient, string>;
  pending!: Table<PendingChange, string>;

  constructor(userId: string) {
    super(`MedFichasDB:user:${userId}`);
    this.version(1).stores({patients: "id, full_name", pending: "id"});
  }

  async save(patient: Patient) {
    await this.transaction("rw", this.patients, this.pending, async () => {
      await this.patients.put(patient);
      await this.pending.put({
        kind: "save",
        id: patient.id,
        patient,
        revision: crypto.randomUUID(),
      });
    });
  }

  async remove(id: string) {
    await this.transaction("rw", this.patients, this.pending, async () => {
      await this.patients.delete(id);
      await this.pending.put({kind: "delete", id, revision: crypto.randomUUID()});
    });
  }

  async acknowledge(change: PendingChange) {
    await this.transaction("rw", this.pending, async () => {
      if ((await this.pending.get(change.id))?.revision === change.revision) {
        await this.pending.delete(change.id);
      }
    });
  }

  async mergeRemote(patients: Patient[]) {
    await this.transaction("rw", this.patients, this.pending, async () => {
      const pendingIds = new Set(await this.pending.toCollection().primaryKeys());
      const remoteIds = new Set(patients.map((patient) => patient.id));

      for (const patient of await this.patients.toArray()) {
        if (!pendingIds.has(patient.id) && !remoteIds.has(patient.id)) {
          await this.patients.delete(patient.id);
        }
      }
      await this.patients.bulkPut(patients.filter((patient) => !pendingIds.has(patient.id)));
    });
  }

  async clearCache() {
    await this.transaction("rw", this.patients, this.pending, async () => {
      const pendingIds = new Set(await this.pending.toCollection().primaryKeys());

      await this.patients.filter((patient) => !pendingIds.has(patient.id)).delete();
    });
  }
}
