"use client";

import React, {useState} from "react";
import {toast} from "sonner";
import {ZodError} from "zod";

import {usePatients} from "./providers/PatientsProvider";

import {Card, CardHeader, CardDescription, CardContent, CardFooter} from "@/components/ui/card";
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
  const [patient, setPatient] = useState(initialPatient);
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
      setPatient(saved);
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
    <Card className="w-full min-w-0 max-w-3xl">
      <CardHeader className="p-4 sm:p-6">
        <h1 className="break-words text-2xl font-semibold tracking-tight">
          {patient ? patient.full_name.trim() || "Ficha del paciente" : "Nuevo paciente"}
        </h1>
        <CardDescription>
          Solo el nombre es obligatorio. Podés completar el resto después.
        </CardDescription>
      </CardHeader>
      <form
        className="[&_input]:h-11 [&_input]:min-w-0 [&_input]:max-w-full [&_input]:text-base md:[&_input]:text-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void handleFormAction(new FormData(event.currentTarget));
        }}
      >
        <CardContent className="grid min-w-0 gap-8 px-4 pb-6 pt-0 sm:px-6">
          <input name="id" type="hidden" value={patientId || ""} />
          <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-4 text-base font-semibold">Datos personales</legend>
            <div className="min-w-0 space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Nombre</Label>
              <Input
                required
                autoComplete="name"
                defaultValue={patient?.full_name || ""}
                id="full_name"
                name="full_name"
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="dob">Fecha de nacimiento</Label>
              <Input
                autoComplete="bday"
                defaultValue={patient?.dob || ""}
                id="dob"
                name="dob"
                type="date"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select defaultValue={patient?.gender || ""} name="gender">
                <SelectTrigger className="h-11 text-base md:text-sm" id="gender">
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="min-h-11" value="male">
                    Masculino
                  </SelectItem>
                  <SelectItem className="min-h-11" value="female">
                    Femenino
                  </SelectItem>
                  <SelectItem className="min-h-11" value="other">
                    Otro
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </fieldset>
          <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-4 text-base font-semibold">Contacto y cobertura</legend>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="phone_number">Teléfono</Label>
              <Input
                autoComplete="tel"
                defaultValue={patient?.phone_number || ""}
                id="phone_number"
                name="phone_number"
                placeholder="Código de área y número"
                type="tel"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                defaultValue={patient?.email || ""}
                id="email"
                name="email"
                placeholder="nombre@ejemplo.com"
                type="email"
              />
            </div>
            <div className="min-w-0 space-y-2 sm:col-span-2">
              <Label htmlFor="health_insurance">Obra Social</Label>
              <Input
                defaultValue={patient?.health_insurance || ""}
                id="health_insurance"
                name="health_insurance"
                placeholder="Nombre de la obra social o prepaga"
              />
            </div>
          </fieldset>
          <div className="min-w-0 space-y-2">
            <Label className="text-base font-semibold" htmlFor="notes">
              Historia clínica
            </Label>
            <Textarea
              className="min-h-64 resize-y text-base leading-relaxed md:text-sm"
              defaultValue={patient?.notes || ""}
              id="notes"
              name="notes"
              placeholder="Antecedentes, consultas y evolución del paciente"
            />
          </div>
        </CardContent>
        <CardFooter className="sticky bottom-0 z-10 flex gap-3 rounded-b-lg border-t bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:justify-end sm:px-6 sm:pb-6">
          <a
            className={buttonVariants({
              className: "h-11 flex-1 sm:flex-none",
              variant: "secondary",
            })}
            href="/"
          >
            Volver
          </a>
          <Button className="h-11 flex-1 sm:flex-none" disabled={isSaving || !module} type="submit">
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PatientForm;
