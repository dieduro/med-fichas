"use client";

import React, {useState} from "react";
import {Settings, Plus} from "lucide-react";

import PatientsList from "./PatientsList";
import PackageIcon from "./svg/Package";
import SearchIcon from "./svg/Search";
import {SubtleOfflineIndicator} from "./ui/SubtleOfflineIndicator";
import {usePatients} from "./providers/PatientsProvider";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const Dashboard = () => {
  const {patients, ready, status, error} = usePatients();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const createNewPatient = () => {
    window.location.assign("/patient/new");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-muted/40 px-6">
        <div className="flex items-center gap-4">
          <a className="flex items-center gap-2 font-semibold" href="/">
            <PackageIcon className="h-6 w-6" />
            <span className="sr-only">Medical App</span>
          </a>
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
          <a href="/admin">
            <Button size="icon" title="Admin Settings" variant="ghost">
              <Settings className="h-5 w-5" />
            </Button>
          </a>
          <SubtleOfflineIndicator />
          <Button
            className="hidden md:flex"
            disabled={status !== "authenticated"}
            onClick={createNewPatient}
          >
            Nuevo Paciente
          </Button>
        </div>
      </header>
      <main className="relative grid flex-1 p-6">
        {status === "signed-out" ? (
          <a href="/login">Iniciá sesión para ver tus pacientes</a>
        ) : !ready ? (
          <p>Cargando pacientes...</p>
        ) : (
          <div>
            {error ? <p role="alert">{error}</p> : null}
            <PatientsList patients={patients} searchValue={searchValue} />
          </div>
        )}

        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg md:hidden"
          disabled={status !== "authenticated"}
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
