"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {createClient} from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();

  const {error} = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
    // Optionally handle the error, e.g., redirect to an error page
    // redirect('/error')
    // For now, we still try to redirect to login
  }

  revalidatePath("/", "layout"); // Revalidate all paths
  redirect("/login");
}
