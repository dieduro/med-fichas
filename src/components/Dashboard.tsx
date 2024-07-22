"use client";

import Link from "next/link";
import React, {useState} from "react";
import {useRouter} from "next/navigation";

import {clearLocalPatients} from "../lib/localStorageService";

import PatientsList from "./PatientsList";
import PackageIcon from "./svg/Package";
import SearchIcon from "./svg/Search";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Patient} from "@/types/Patient";

const Dashboard: React.FC<{patients: Patient[]}> = ({patients}) => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const createNewPatient = () => {
    router.push(`/patient/new`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-muted/40 px-6">
        <div className="flex items-center gap-4">
          <Link className="flex items-center gap-2 font-semibold" href="#" prefetch={false}>
            <PackageIcon className="h-6 w-6" />
            <span className="sr-only">Medical App</span>
          </Link>
          <form className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full pl-8"
              placeholder="Buscar..."
              type="search"
              onChange={handleSearchChange}
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={createNewPatient}>Nuevo Paciente</Button>
        </div>
      </header>
      <main className="grid flex-1 grid-cols-1 gap-8 p-6 md:grid-cols-[1fr_300px]">
        <PatientsList patients={patients} searchValue={searchValue} />
        <Button variant="destructive" onClick={clearLocalPatients}>
          Borrar pacientes
        </Button>
      </main>
    </div>
  );
};

export default Dashboard;
