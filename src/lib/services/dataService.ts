import {dbOperations} from "../db/dexieDb";

import {syncService} from "./syncService";

import {createClient} from "@/utils/supabase/client";
import {Patient} from "@/types/Patient";

// Create a Supabase client
const supabase = createClient();

// Service for handling data operations with offline support
export const dataService = {
  // Get patients with offline support
  async getPatients(): Promise<Patient[]> {
    try {
      // If online, try to fetch from Supabase first
      if (syncService.isOnline()) {
        try {
          const {data, error} = await supabase
            .from("patients")
            .select("*")
            .order("created_at", {ascending: false});

          if (!error && data) {
            // Store the fetched data in IndexedDB for offline use
            for (const patient of data) {
              await dbOperations.savePatient(patient as Patient);
            }

            return data as Patient[];
          }
        } catch (error) {
          console.error("Error fetching patients from Supabase:", error);
          // Fall back to local data if Supabase fetch fails
        }
      }

      // If offline or Supabase fetch failed, get from IndexedDB
      return await dbOperations.getPatients();
    } catch (error) {
      console.error("Error in getPatients:", error);

      return [];
    }
  },

  // Get a single patient with offline support
  async getPatient(id: string): Promise<Patient | null> {
    try {
      // If online, try to fetch from Supabase first
      if (syncService.isOnline()) {
        try {
          const {data, error} = await supabase.from("patients").select("*").eq("id", id).single();

          if (!error && data) {
            // Store the fetched data in IndexedDB for offline use
            await dbOperations.savePatient(data as Patient);

            return data as Patient;
          }
        } catch (error) {
          console.error(`Error fetching patient ${id} from Supabase:`, error);
          // Fall back to local data if Supabase fetch fails
        }
      }

      // If offline or Supabase fetch failed, get from IndexedDB
      const patient = await dbOperations.getPatient(id);

      return patient || null;
    } catch (error) {
      console.error(`Error in getPatient(${id}):`, error);

      return null;
    }
  },

  // Save a patient with offline support
  async savePatient(patient: Patient): Promise<{success: boolean; id?: string; error?: string}> {
    try {
      // Generate an ID if it doesn't exist
      const patientWithId = {
        ...patient,
        id: patient.id || crypto.randomUUID(),
        // Add user_id to help with RLS policies
        user_id: "system",
      };

      // If online, try to save to Supabase first
      if (syncService.isOnline()) {
        try {
          // Remove the age field before saving to Supabase
          const {age, ...patientWithoutAge} = patientWithId;

          // Try to upsert with user_id
          const {error} = await supabase.from("patients").upsert(patientWithoutAge);

          if (error) {
            console.error("Error saving patient to Supabase:", error);
            // Fall back to local save if Supabase save fails
          } else {
            // If Supabase save succeeds, also save locally
            await dbOperations.savePatient(patientWithId);

            return {success: true, id: patientWithId.id};
          }
        } catch (error) {
          console.error("Error in Supabase save:", error);
          // Fall back to local save
        }
      }

      // If offline or Supabase save failed, save to IndexedDB
      console.log("Saving patient to IndexedDB");
      const id = await dbOperations.savePatient(patientWithId);

      console.log("Patient saved to IndexedDB", id);

      return {success: true, id};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("Error in savePatient:", errorMessage);

      return {success: false, error: errorMessage};
    }
  },

  // Delete a patient with offline support
  async deletePatient(id: string): Promise<{success: boolean; error?: string}> {
    try {
      // If online, try to delete from Supabase first
      if (syncService.isOnline()) {
        try {
          const {error} = await supabase.from("patients").delete().eq("id", id);

          if (error) {
            console.error(`Error deleting patient ${id} from Supabase:`, error);
            // Fall back to local delete if Supabase delete fails
          } else {
            // If Supabase delete succeeds, also delete locally
            await dbOperations.deletePatient(id);

            return {success: true};
          }
        } catch (error) {
          console.error("Error in Supabase delete:", error);
          // Fall back to local delete
        }
      }

      // If offline or Supabase delete failed, delete from IndexedDB
      await dbOperations.deletePatient(id);

      return {success: true};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`Error in deletePatient(${id}):`, errorMessage);

      return {success: false, error: errorMessage};
    }
  },
};

export default dataService;
