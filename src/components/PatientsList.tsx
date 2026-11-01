"use client";

import {Search, Users} from "lucide-react";

import PatientRow from "./PatientRow";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "./ui/table";
import {Button} from "./ui/button";

import {Patient} from "@/types/Patient";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const PatientsList: React.FC<{searchValue: string; patients: Patient[]}> = ({
  searchValue = "",
  patients,
}) => {
  const query = normalizeSearch(searchValue);
  const filteredPatients = patients.filter((patient) =>
    [patient.full_name, patient.health_insurance || ""].some((value) =>
      normalizeSearch(value).includes(query),
    ),
  );

  return (
    <section aria-labelledby="patients-heading" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold" id="patients-heading">
          Pacientes
        </h2>
        <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
          {query
            ? `${filteredPatients.length} de ${patients.length} pacientes`
            : `${patients.length} ${patients.length === 1 ? "paciente" : "pacientes"}`}
        </p>
      </div>
      {patients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
          <Users aria-hidden="true" className="h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">No hay pacientes registrados</h3>
          <p className="text-sm text-muted-foreground">Agregá tu primer paciente para empezar.</p>
          <Button asChild className="h-11">
            <a href="/patient/new">Agregar paciente</a>
          </Button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
          <Search aria-hidden="true" className="h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">No encontramos pacientes</h3>
          <p className="break-words text-sm text-muted-foreground">
            No hay coincidencias para “{searchValue.trim()}”. Probá con otro nombre u obra social.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="hidden sm:table-header-group">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Obra Social</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <PatientRow key={patient.id} patient={patient} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};

export default PatientsList;
