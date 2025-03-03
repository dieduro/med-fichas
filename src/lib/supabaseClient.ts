import {createClient} from "@/utils/supabase/server";

// Create and export a server-side client with elevated privileges
export const supabaseAdmin = createClient();
