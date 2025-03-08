import {createClient} from "@/utils/supabase/client";

// Create a Supabase client
const supabase = createClient();

async function checkRLSPolicies() {
  console.log("Checking RLS policies for patients table...");

  try {
    // Try to get the RLS policies (this requires admin privileges)
    const {data, error} = await supabase.rpc("get_policies", {
      table_name: "patients",
    });

    if (error) {
      console.error("Error getting RLS policies:", error);
      console.log("You may need to run this query in the Supabase SQL editor:");
      console.log(`
        -- Check RLS policies for patients table
        SELECT * FROM pg_policies WHERE tablename = 'patients';
      `);
    } else {
      console.log("RLS policies:", data);
    }

    // Try a simple query to test access
    console.log("Testing access to patients table...");
    const {data: patients, error: queryError} = await supabase
      .from("patients")
      .select("id")
      .limit(1);

    if (queryError) {
      console.error("Error querying patients table:", queryError);
    } else {
      console.log("Successfully queried patients table:", patients);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the function
checkRLSPolicies();
