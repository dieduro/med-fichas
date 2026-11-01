"use client";

import {ChevronRight} from "lucide-react";

import {TableCell, TableRow} from "./ui/table";

import {Patient} from "@/types/Patient";

interface PatientRowProps {
  patient: Patient;
}

const PatientRow: React.FC<PatientRowProps> = ({patient}) => {
  const href = `/patient/${patient.id}`;

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (e.target instanceof Element && e.target.closest("a")) return;
    window.location.assign(href);
  };

  return (
    <TableRow
      className="cursor-pointer transition-colors focus-within:bg-muted/50 active:bg-muted"
      onClick={handleClick}
    >
      <TableCell className="p-0 sm:p-4">
        <a
          aria-label={patient.full_name.trim() || "Paciente sin nombre"}
          className="flex min-h-16 w-full items-center justify-between gap-3 px-3 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-0 sm:p-0"
          href={href}
        >
          <span className="min-w-0 break-words">
            <span className="font-medium">{patient.full_name.trim() || "Paciente sin nombre"}</span>
            <span className="mt-1 block text-sm text-muted-foreground sm:hidden">
              {patient.health_insurance || "Sin obra social registrada"}
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-muted-foreground sm:hidden"
          />
        </a>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{patient.health_insurance || "-"}</TableCell>
    </TableRow>
  );
};

export default PatientRow;
