import PatientForm from "@/components/PatientForm";

export default function Page({params}: {params: {id: string}}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <PatientForm patientId={params.id} />
    </div>
  );
}
