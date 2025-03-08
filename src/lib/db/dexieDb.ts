import Dexie, {type Table} from "dexie";

import {Patient} from "@/types/Patient";

// Define additional types for offline sync
export interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  tableName: string;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

// Define the database schema
export class MedFichasDatabase extends Dexie {
  patients!: Table<Patient>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("MedFichasDB");

    this.version(1).stores({
      patients: "id, full_name, email, phone_number, gender, dob, age",
      syncQueue: "id, operation, tableName, timestamp, synced",
    });
  }
}

// Create a database instance
export const db = new MedFichasDatabase();

// Helper functions for database operations
export const dbOperations = {
  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return await db.patients.toArray();
  },

  async getPatient(id: string): Promise<Patient | undefined> {
    return await db.patients.get(id);
  },

  async savePatient(patient: Patient): Promise<string> {
    const id = patient.id || crypto.randomUUID();
    const patientWithId = {...patient, id};

    await db.patients.put(patientWithId);

    // Add to sync queue
    await db.syncQueue.put({
      id: crypto.randomUUID(),
      operation: patient.id ? "update" : "create",
      tableName: "patients",
      data: patientWithId,
      timestamp: Date.now(),
      synced: false,
    });

    return id;
  },

  async deletePatient(id: string): Promise<void> {
    await db.patients.delete(id);

    // Add to sync queue
    await db.syncQueue.put({
      id: crypto.randomUUID(),
      operation: "delete",
      tableName: "patients",
      data: {id},
      timestamp: Date.now(),
      synced: false,
    });
  },

  // Sync queue operations
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return await db.syncQueue.filter((item) => !item.synced).toArray();
  },

  async markAsSynced(id: string): Promise<void> {
    await db.syncQueue.update(id, {synced: true});
  },

  async clearSyncedItems(): Promise<void> {
    await db.syncQueue.filter((item) => item.synced).delete();
  },
};

export default db;
