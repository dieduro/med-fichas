"use client";

import React, {useState, useEffect, FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Loader2} from "lucide-react";
import {toast} from "sonner";

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
    try {
      // Convert FormData to Patient object
      const patientId = formData.get("id") as string;

      console.log("Form submission - Patient ID:", patientId);

      const patientToSave: Patient = {
        full_name: formData.get("full_name") as string,
        email: formData.get("email") as string,
        phone_number: formData.get("phone_number") as string,
        gender: formData.get("gender") as string,
        dob: formData.get("dob") as string,
        notes: formData.get("notes") as string,
        health_insurance: formData.get("health_insurance") as string,
        id: patientId || undefined,
        user_id: "system", // Add user_id to help with RLS policies
      };

      console.log("Saving patient with ID:", patientToSave.id);

      // Show saving toast
      const toastId = toast.loading(
        patientId ? "Actualizando paciente..." : "Guardando paciente...",
      );

      const result = await dataService.savePatient(patientToSave);

      if (result.success) {
        // Update toast on success
        toast.success(
          patientId ? "Paciente actualizado correctamente" : "Paciente guardado correctamente",
          {id: toastId},
        );
        router.push(`/patient/${result.id}`);
      } else {
        // Show error toast
        toast.error(
          `Error al ${patientId ? "actualizar" : "guardar"} el paciente: ${result.error || "Error desconocido"}`,
          {id: toastId},
        );
        // We don't need to reset isSubmitting here as we're not using it after form submission
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      // Show error toast
      toast.error(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
      // We don't need to reset isSubmitting here as we're not using it after form submission
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
          {/* Hidden input for patient ID */}
          <input name="id" type="hidden" value={patientData?.id || ""} />
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
            <div className="space-y-2">
              <Label htmlFor="health_insurance">Obra Social</Label>
              <Input
                defaultValue={patientData?.health_insurance || ""}
                id="health_insurance"
                name="health_insurance"
                placeholder="Obra Social del paciente"
                onChange={handleChange}
              />
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
