"use client";

import React, {useRef, useState} from "react";
import {Settings, Plus, X} from "lucide-react";

import PatientsList from "./PatientsList";
import SearchIcon from "./svg/Search";
import {SubtleOfflineIndicator} from "./ui/SubtleOfflineIndicator";
import {usePatients} from "./providers/PatientsProvider";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const Dashboard = () => {
  const {patients, ready, status, error, module, isSyncing} = usePatients();
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const loadingPatients = !ready || (isSyncing && patients.length === 0 && !error);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const createNewPatient = () => {
    window.location.assign("/patient/new");
  };

  return (
    <div className="-mx-4 flex flex-col sm:mx-0">
      <header className="flex items-center gap-3 border-b py-4 sm:px-6">
        <div aria-label="Buscar pacientes" className="relative min-w-0 flex-1" role="search">
          <SearchIcon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            aria-label="Buscar pacientes por nombre u obra social"
            autoComplete="off"
            className="h-11 w-full pl-9 pr-11 text-base md:text-sm [&::-webkit-search-cancel-button]:appearance-none"
            placeholder="Nombre u obra social"
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue ? (
            <Button
              aria-label="Limpiar búsqueda"
              className="absolute right-0 top-0 h-11 w-11"
              size="icon"
              variant="ghost"
              onClick={() => {
                setSearchValue("");
                searchRef.current?.focus();
              }}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Button asChild className="h-11 w-11" size="icon" variant="ghost">
            <a aria-label="Configuración" href="/admin">
              <Settings aria-hidden="true" className="h-5 w-5" />
            </a>
          </Button>
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
      <main className="relative min-w-0 flex-1 pb-28 pt-6 sm:px-6 md:pb-6">
        {status === "signed-out" ? (
          <a href="/login">Iniciá sesión para ver tus pacientes</a>
        ) : loadingPatients ? (
          <p aria-live="polite" role="status">
            Cargando pacientes...
          </p>
        ) : (
          <div>
            {error ? (
              <div className="mb-4 space-y-2" role="alert">
                <p>{error}</p>
                <Button
                  disabled={isSyncing || !module}
                  variant="outline"
                  onClick={() => {
                    void module?.sync();
                  }}
                >
                  {isSyncing ? "Reintentando..." : "Reintentar"}
                </Button>
              </div>
            ) : null}
            {patients.length > 0 || !error ? (
              <PatientsList patients={patients} searchValue={searchValue} />
            ) : null}
          </div>
        )}

        <Button
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-40 h-14 w-14 rounded-full p-0 shadow-lg md:hidden"
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
