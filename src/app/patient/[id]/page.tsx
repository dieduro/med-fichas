import PatientForm from "@/components/PatientForm";
import {createClient} from "@/utils/supabase/server";

const getPatientById = async (id: string) => {
  const supabase = createClient();

  return supabase.from("patients").select("*").eq("id", id).single();
};

export default async function Page({params}: {params: {id: string}}) {
  const {id} = params;

  const {data: patient} = id !== "new" ? await getPatientById(id) : {data: undefined};

  return (
    <div className="flex flex-col items-center">
      <PatientForm patient={patient} />
    </div>
  );
}
