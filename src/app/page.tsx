import Dashboard from "@/components/Dashboard";
import {api} from "@/lib/db";
import {Patient} from "@/types/Patient";

export default async function HomePage() {
  const patients = await api.getPatients();

  return <Dashboard patients={patients as Patient[]} />;
}
