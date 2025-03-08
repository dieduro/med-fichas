import {dbOperations} from "../db/dexieDb";

import {createClient} from "@/utils/supabase/client";
import {Patient} from "@/types/Patient";

// Create a Supabase client
const supabase = createClient();

// Service for handling online/offline synchronization
export const syncService = {
  // Check if the app is online
  isOnline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine;
  },

  // Initialize listeners for online/offline events
  initListeners(onlineCallback: () => void, offlineCallback: () => void): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", onlineCallback);
    window.addEventListener("offline", offlineCallback);

    // Return initial status
    if (this.isOnline()) {
      onlineCallback();
    } else {
      offlineCallback();
    }
  },

  // Remove listeners for online/offline events
  removeListeners(onlineCallback: () => void, offlineCallback: () => void): void {
    if (typeof window === "undefined") return;

    window.removeEventListener("online", onlineCallback);
    window.removeEventListener("offline", offlineCallback);
  },

  // Sync data with Supabase when online
  async syncWithSupabase(): Promise<{success: boolean; errors: string[]}> {
    if (!this.isOnline()) {
      console.log("Cannot sync: Device is offline");

      return {success: false, errors: ["Device is offline"]};
    }

    const pendingItems = await dbOperations.getPendingSyncItems();
    const errors: string[] = [];

    console.log(`Syncing with Supabase: Found ${pendingItems.length} pending items`, pendingItems);

    if (pendingItems.length === 0) {
      console.log("No pending items to sync");

      return {success: true, errors: []};
    }

    for (const item of pendingItems) {
      try {
        if (item.tableName === "patients") {
          const patient = item.data as unknown as Patient;

          console.log(`Syncing ${item.operation} operation for patient ${patient.id}`);

          if (item.operation === "create" || item.operation === "update") {
            // Create a copy of the patient object without the user_id field
            // to avoid the error when the column doesn't exist
            const {user_id, ...patientWithoutUserId} = patient;

            // Try to upsert with user_id set to 'system' to work with RLS policies
            const patientWithSystemUserId = {
              ...patientWithoutUserId,
              user_id: "system",
            };

            console.log(
              `Attempting to sync patient with user_id='system':`,
              patientWithSystemUserId,
            );

            // Try to upsert with user_id
            const {error} = await supabase.from("patients").upsert(patientWithSystemUserId);

            if (error) {
              console.error(`Error syncing patient ${patient.id}:`, error);

              // If we get an RLS error, log more details to help debugging
              if (error.code === "42501") {
                console.error(
                  `This is an RLS policy violation. Please check your RLS policies in Supabase.`,
                );
                console.error(`You may need to run the SQL in src/scripts/fix-rls-policies.sql`);
              }

              errors.push(`Error syncing patient ${patient.id}: ${error.message}`);
              continue;
            }
            console.log(`Successfully synced patient ${patient.id}`);
          } else if (item.operation === "delete") {
            const {error} = await supabase.from("patients").delete().eq("id", patient.id);

            if (error) {
              console.error(`Error deleting patient ${patient.id}:`, error);
              errors.push(`Error deleting patient ${patient.id}: ${error.message}`);
              continue;
            }
            console.log(`Successfully deleted patient ${patient.id}`);
          }
        }

        // Mark as synced if successful
        await dbOperations.markAsSynced(item.id);
        console.log(`Marked item ${item.id} as synced`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`Sync error for ${item.tableName} (${item.operation}):`, error);
        errors.push(`Sync error for ${item.tableName} (${item.operation}): ${errorMessage}`);
      }
    }

    // Clean up synced items
    await dbOperations.clearSyncedItems();
    console.log("Cleared synced items");

    return {
      success: errors.length === 0,
      errors,
    };
  },

  // Load data from Supabase to IndexedDB
  async loadDataFromSupabase(): Promise<{success: boolean; error?: string}> {
    if (!this.isOnline()) {
      return {success: false, error: "Device is offline"};
    }

    try {
      // Fetch patients from Supabase
      const {data: patients, error} = await supabase
        .from("patients")
        .select("*")
        .order("created_at", {ascending: false});

      if (error) {
        return {success: false, error: error.message};
      }

      // Store patients in IndexedDB
      for (const patient of patients) {
        await dbOperations.savePatient(patient as Patient);
      }

      return {success: true};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {success: false, error: errorMessage};
    }
  },
};

export default syncService;
