"use client";

import Link from "next/link";
import React, {useState} from "react";

import NextAppointments from "./NextAppointments";
import PatientsList from "./PatientsList";
import PackageIcon from "./svg/Package";
import SearchIcon from "./svg/Search";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const Dashboard: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
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
          <Button className="rounded-full" size="icon" variant="ghost">
            <img alt="Avatar" className="rounded-full" height="32" src="/vercel.svg" width="32" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </div>
      </header>
      <main className="grid flex-1 grid-cols-1 gap-8 p-6 md:grid-cols-[1fr_300px]">
        <PatientsList searchValue={searchValue} />
        <NextAppointments />
      </main>
    </div>
  );
};

export default Dashboard;
