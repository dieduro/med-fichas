import Dashboard from "@/components/Dashboard";
import {Patient} from "@/types/Patient";
import {createClient} from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = createClient();

  const {data: patients} = await supabase.from("patients").select("*"); //.from("testTable").select("*").limit(10);

  return <Dashboard patients={patients as Patient[]} />;
}
