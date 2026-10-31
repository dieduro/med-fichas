"use client";

import React, {useState} from "react";
import {toast} from "sonner";
import {ZodError} from "zod";

import {usePatients} from "./providers/PatientsProvider";

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
import {patientDraftSchema, type Patient} from "@/types/Patient";

const PatientForm = ({patient: initialPatient}: {patient: Patient | undefined}) => {
  const [patient, setSavedPatient] = useState(initialPatient);
  const {module} = usePatients();
  const [patientId, setPatientId] = useState(patient?.id);
  const [isSaving, setIsSaving] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    if (!module || isSaving) return;
    setIsSaving(true);
    const toastId = toast.loading("Guardando paciente...");

    try {
      const draft = patientDraftSchema.parse(Object.fromEntries(formData));
      const saved = await module.save(draft, patientId);

      setPatientId(saved.id);
      setSavedPatient(saved);
      toast.success(
        "Paciente guardado en este dispositivo. Los cambios se sincronizan al conectar.",
        {id: toastId},
      );
    } catch (error) {
      toast.error(
        error instanceof ZodError
          ? error.issues[0].message
          : error instanceof Error
            ? error.message
            : "No se pudo guardar",
        {id: toastId},
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Información del paciente</CardTitle>
        <CardDescription>Completar el formulario con la información del paciente</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleFormAction(new FormData(event.currentTarget));
        }}
      >
        <CardContent className="grid gap-6">
          {/* Hidden input for patient ID */}
          <input name="id" type="hidden" value={patientId || ""} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre</Label>
              <Input
                required
                defaultValue={patient?.full_name || ""}
                id="full_name"
                name="full_name"
                placeholder="Nombre del paciente"
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
              <Label htmlFor="phone_number">Teléfono</Label>
              <Input
                defaultValue={patient?.phone_number || ""}
                id="phone_number"
                name="phone_number"
                placeholder="Teléfono del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Fecha de nacimiento</Label>
              <Input defaultValue={patient?.dob || ""} id="dob" name="dob" type="date" />
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
            <div className="space-y-2">
              <Label htmlFor="health_insurance">Obra Social</Label>
              <Input
                defaultValue={patient?.health_insurance || ""}
                id="health_insurance"
                name="health_insurance"
                placeholder="Obra Social del paciente"
              />
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
          <a className={buttonVariants({variant: "secondary"})} href="/">
            Volver
          </a>
          <Button disabled={isSaving || !module} type="submit">
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PatientForm;
