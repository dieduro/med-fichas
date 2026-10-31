import Dexie from "dexie";

// Ownership of the old shared cache cannot be inferred from the current session.
export async function readLegacyPatients() {
  let patients: unknown[] = [];
  let pendingChanges: unknown[] = [];

  if (await Dexie.exists("MedFichasDB")) {
    const legacy = new Dexie("MedFichasDB");

    try {
      await legacy.open();
      patients = await legacy.table("patients").toArray();
      pendingChanges = await legacy.table("syncQueue").toArray();
    } finally {
      legacy.close();
    }
  }

  return {patients, pendingChanges, localStoragePatients: localStorage.getItem("offlinePatients")};
}
