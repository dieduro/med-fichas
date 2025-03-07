import {createClient} from "@/utils/supabase/server";

// Create and export a server-side client with elevated privileges
// Since createClient is now async, we need to create a function that returns a promise
export const getSupabaseAdmin = async () => {
  return await createClient();
};
