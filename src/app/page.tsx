import Link from "next/link";

import Dashboard from "@/components/Dashboard";
import {api} from "@/lib/db";
import {Patient} from "@/types/Patient";
import {createClient} from "@/lib/supabase/server"; // Import server client

// Helper to get initials from email
function getInitials(email: string): string {
  if (!email) return "?";
  const parts = email.split("@")[0].split(/[.\-_]/);

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function HomePage() {
  const supabase = await createClient(); // Create server client instance
  const {
    data: {user},
  } = await supabase.auth.getUser(); // Get user session

  const patients = user ? await api.getPatients() : []; // Fetch patients only if logged in

  return (
    <div>
      {user ? (
        <Dashboard patients={patients as Patient[]} />
      ) : (
        <div className="p-10 text-center">
          <p>
            Please{" "}
            <Link className="text-blue-600 hover:underline" href="/login">
              login
            </Link>{" "}
            to view the dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
