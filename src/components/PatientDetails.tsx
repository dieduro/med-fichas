"use client";

import Link from "next/link";

import PatientForm from "./PatientForm";
import {usePatients} from "./providers/PatientsProvider";

export default function PatientDetails({id}: {id: string}) {
  const {patients, ready, status, isSyncing, error} = usePatients();

  if (status === "loading" || !ready) return <p>Cargando ficha...</p>;
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
    <div className="flex flex-col items-center">
      <PatientForm key={id} patient={patient} />
    </div>
  );
}
