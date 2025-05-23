"use client";

import PatientRow from "./PatientRow";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "./ui/table";

import {Patient} from "@/types/Patient";

const PatientsList: React.FC<{searchValue: string; patients: Patient[]}> = ({
  searchValue = "",
  patients,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pacientes</h2>
        {patients.length === 0 ? (
          <p>No hay pacientes registrados</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Obra Social</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border">
              {patients
                .filter((patient) =>
                  patient.full_name.toLowerCase().includes(searchValue.toLowerCase()),
                )
                .map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PatientsList;
