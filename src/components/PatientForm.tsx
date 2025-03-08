"use client";

import React, {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

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
import {dataService} from "@/lib/services/dataService";

const PatientForm: React.FC<{
  patient: Patient | undefined;
}> = ({patient}) => {
  const [patientData, setPatientData] = useState<Patient | undefined>(patient);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientData((prev) => ({...prev, [e.target.name]: e.target.value}) as Patient);
  };

  // Extract form action to a function
  const handleFormAction = async (formData: FormData) => {
    // Convert FormData to Patient object
    const patient: Patient = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone_number: formData.get("phone_number") as string,
      gender: formData.get("gender") as string,
      dob: formData.get("dob") as string,
      notes: formData.get("notes") as string,
      id: (formData.get("id") as string) || undefined,
      user_id: "system", // Add user_id to help with RLS policies
    };

    console.log("Saving patient!!");
    const result = await dataService.savePatient(patient);

    if (result.success) {
      router.push(`/patient/${result.id}`);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Información del paciente</CardTitle>
        <CardDescription>Completar el formulario con la información del paciente</CardDescription>
      </CardHeader>
      <form action={handleFormAction}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre</Label>
              <Input
                defaultValue={patientData?.full_name || ""}
                id="full_name"
                name="full_name"
                placeholder="Nombre del paciente"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                defaultValue={patientData?.email || ""}
                id="email"
                name="email"
                placeholder="Email del paciente"
                type="email"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Teléfono</Label>
              <Input
                defaultValue={patientData?.phone_number || ""}
                id="phone_number"
                name="phone_number"
                placeholder="Teléfono del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Fecha de nacimiento</Label>
              <Input
                defaultValue={patientData?.dob || ""}
                id="dob"
                name="dob"
                type="date"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select defaultValue={patientData?.gender || ""} name="gender">
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
              defaultValue={patientData?.notes || ""}
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
