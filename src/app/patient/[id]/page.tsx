import PatientForm from "@/components/PatientForm";
import {createClient} from "@/utils/supabase/server";

const getPatientById = async (id: string) => {
  const supabase = await createClient();

  return supabase.from("patients").select("*").eq("id", id).single();
};

export default async function Page({params}: {params: {id: string}}) {
  // In Next.js 15, params should be awaited before using its properties
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const {data: patient} = id !== "new" ? await getPatientById(id) : {data: undefined};

  return (
    <div className="flex flex-col items-center">
      <PatientForm patient={patient} />
    </div>
  );
}
