"use client";

import Link from "next/link";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Settings, Plus} from "lucide-react";

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
          <Link href="/admin">
            <Button size="icon" title="Admin Settings" variant="ghost">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button className="hidden md:flex" onClick={createNewPatient}>
            Nuevo Paciente
          </Button>
        </div>
      </header>
      <main className="relative grid flex-1 p-6">
        <PatientsList patients={patients} searchValue={searchValue} />

        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg md:hidden"
          size="icon"
          onClick={createNewPatient}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Nuevo Paciente</span>
        </Button>
      </main>
    </div>
  );
};

export default Dashboard;
