import PatientForm from "@/components/PatientForm";

export default async function Page({params}: {params: {id: string}}) {
  return (
    <div className="flex h-screen flex-col items-center">
      <PatientForm patientId={params.id} />
    </div>
  );
}
