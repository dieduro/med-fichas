import PatientRow from "./PatientRow";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "./ui/table";

import {Patient} from "@/types/Patient";

const PatientsList: React.FC<{searchValue: string}> = ({searchValue = ""}) => {
  const patients: Patient[] = [
    {
      id: "1",
      name: "John Doe",
      age: 35,
      lastVisit: "2023-04-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      age: 42,
      lastVisit: "2023-03-20",
    },
    {
      id: "3",
      name: "Michael Johnson",
      age: 28,
      lastVisit: "2023-05-01",
    },
    {
      id: "4",
      name: "Emily Brown",
      age: 19,
      lastVisit: "2023-02-28",
    },
    {
      id: "5",
      name: "David Lee",
      age: 51,
      lastVisit: "2023-06-10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pacientes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Última visita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border">
            {patients
              .filter((patient) => patient.name.toLowerCase().includes(searchValue.toLowerCase()))
              .map((patient) => (
                <PatientRow key={patient.id} patient={patient} />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientsList;
