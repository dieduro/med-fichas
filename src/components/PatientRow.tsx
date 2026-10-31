"use client";

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
    <TableRow className="cursor-pointer transition-colors" onClick={handleClick}>
      <TableCell>
        <a className="block h-full w-full" href={href}>
          {patient.full_name}
        </a>
      </TableCell>
      <TableCell>{patient.health_insurance || "-"}</TableCell>
    </TableRow>
  );
};

export default PatientRow;
