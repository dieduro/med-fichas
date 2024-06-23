"use client";

import React from "react";
import Link from "next/link";

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

const PatientForm: React.FC<{patientId: string}> = ({patientId}) => {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Información del paciente</CardTitle>
        <CardDescription>Completar el formulario con la información del paciente</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Nombre del paciente" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Email del paciente" type="email" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" placeholder="Teléfono del paciente" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Fecha de nacimiento</Label>
            <Input id="dob" type="date" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select>
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
            id="notes"
            placeholder="Ingresar información clínica relevante"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Link className={buttonVariants({variant: "secondary"})} href="/">
          Volver
        </Link>

        <Button>Guardar</Button>
      </CardFooter>
    </Card>
  );
};

export default PatientForm;
