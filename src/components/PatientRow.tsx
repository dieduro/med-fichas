"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";

import {TableCell, TableRow} from "./ui/table";

import {Patient} from "@/types/Patient";
import {calculateAge} from "@/utils/helpers";

interface PatientRowProps {
  patient: Patient;
}

const PatientRow: React.FC<PatientRowProps> = ({patient}) => {
  const router = useRouter();
  const href = `/patient/${patient.id}`;

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    router.push(href);
  };

  // Calculate age on the fly
  const patientAge = calculateAge(patient.dob);

  return (
    <TableRow className="cursor-pointer transition-colors" onClick={handleClick}>
      <TableCell>
        <Link className="block h-full w-full" href={href}>
          {patient.full_name}
        </Link>
      </TableCell>
      <TableCell>{patientAge}</TableCell>
      <TableCell>{patient.dob}</TableCell>
      <TableCell>{patient.health_insurance || "-"}</TableCell>
    </TableRow>
  );
};

export default PatientRow;
