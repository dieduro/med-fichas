import {syncService} from "@/lib/services/syncService";
import {dataService} from "@/lib/services/dataService";
import {Patient} from "@/types/Patient";

async function testSync() {
  console.log("Testing sync functionality...");
  console.log("Online status:", syncService.isOnline() ? "Online" : "Offline");

  // Test syncing
  console.log("Attempting to sync with Supabase...");
  const syncResult = await syncService.syncWithSupabase();

  console.log("Sync result:", syncResult);

  // Test saving a patient
  const testPatient: Patient = {
    full_name: "Test Patient " + new Date().toISOString(),
    email: "test@example.com",
    phone_number: "123-456-7890",
    gender: "other",
    dob: "2000-01-01",
    notes: "Test patient created by test-sync.ts",
  };

  console.log("Saving test patient...");
  const saveResult = await dataService.savePatient(testPatient);

  console.log("Save result:", saveResult);

  // Test syncing again
  console.log("Attempting to sync with Supabase again...");
  const syncResult2 = await syncService.syncWithSupabase();

  console.log("Sync result 2:", syncResult2);
}

// Run the function
testSync();
