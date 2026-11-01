"use client";

import Link from "next/link";

import PatientForm from "./PatientForm";
import {usePatients} from "./providers/PatientsProvider";

export default function PatientDetails({id}: {id: string}) {
  const {patients, ready, status, isSyncing, error} = usePatients();

  if (status === "loading" || !ready) return <p role="status">Cargando ficha...</p>;
  if (status === "signed-out")
    return <Link href="/login">Iniciá sesión para ver tus pacientes</Link>;
  const patient = patients.find((entry) => entry.id === id);

  if (id !== "new" && !patient) {
    return (
      <p role="status">
        {isSyncing
          ? "Buscando paciente..."
          : error ?? "Paciente no encontrado en los datos disponibles."}
      </p>
    );
  }

  return (
    <div className="-mx-4 flex min-w-0 flex-col items-center sm:mx-0">
      <PatientForm key={id} patient={patient} />
    </div>
  );
}
