"use client";

import {v4 as uuid} from "uuid";
import React, {useState} from "react";
import Link from "next/link";

import {getLocalPatientById, savePatientLocally} from "../lib/localStorageService";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Button, buttonVariants} from "@/components/ui/button";
import {Patient} from "@/types/Patient";

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Check if the birthday has occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const PatientForm: React.FC<{patientId: string | undefined}> = ({patientId}) => {
  const [patient, setPatient] = useState<Patient | undefined>(
    patientId ? getLocalPatientById(patientId) : undefined,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Get the form element
    const data = new FormData(form); // Create a FormData object

    const age = calculateAge(data.get("dateOfBirth") as string);

    const newPatient = {
      id: !patientId || patientId === "new" ? uuid() : patientId,
      age,
      ...Object.fromEntries(data.entries()),
    };

    savePatientLocally(newPatient as Patient);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatient((prev) => ({...prev, [e.target.name]: e.target.value}) as Patient);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Información del paciente</CardTitle>
        <CardDescription>Completar el formulario con la información del paciente</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                defaultValue={patient?.full_name || ""}
                id="name"
                name="name"
                placeholder="Nombre del paciente"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                defaultValue={patient?.email || ""}
                id="email"
                name="email"
                placeholder="Email del paciente"
                type="email"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                defaultValue={patient?.phone || ""}
                id="phone"
                name="phone"
                placeholder="Teléfono del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Fecha de nacimiento</Label>
              <Input defaultValue={patient?.dob || ""} id="dob" name="dateOfBirth" type="date" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select defaultValue={patient?.gender || ""} name="gender">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Historia clínica</Label>
            <Textarea
              className="min-h-[200px]"
              defaultValue={patient?.notes || ""}
              id="notes"
              name="notes"
              placeholder="Ingresar información clínica relevante"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Link className={buttonVariants({variant: "secondary"})} href="/">
            Volver
          </Link>
          <Button type="submit">Guardar</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PatientForm;
