"use client";

import React from "react";
import {toast} from "sonner";

import SyncControls from "./ui/SyncControls";
import {OfflineIndicator} from "./ui/OfflineIndicator";
import {Button} from "./ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {usePatients} from "./providers/PatientsProvider";

import {readLegacyPatients} from "@/lib/patients/legacy";

const AdminDashboard: React.FC = () => {
  const {module, status, isSyncing} = usePatients();
  const clearCache = async () => {
    try {
      await module?.clearCache();
      toast.success("Caché limpiado. Los cambios pendientes se conservaron.");
    } catch {
      toast.error("No se pudo limpiar el caché");
    }
  };
  const exportLegacy = async () => {
    try {
      const legacy = await readLegacyPatients();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(legacy, null, 2)], {type: "application/json"}),
      );
      const link = document.createElement("a");

      link.href = url;
      link.download = "med-fichas-datos-anteriores.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("No se pudieron exportar los datos anteriores");
    }
  };

  if (status !== "authenticated") return <p>Iniciá sesión para administrar tus datos.</p>;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <a href="/">
          <Button variant="outline">Back to Home</Button>
        </a>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <SyncControls />

        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>Manage local patient data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              disabled={!module || isSyncing}
              variant="outline"
              onClick={() => {
                void clearCache();
              }}
            >
              Limpiar caché sincronizado
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Se quitan de este dispositivo solo las fichas sin cambios pendientes. Las fichas del
              servidor y los cambios por enviar se conservan.
            </p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => {
                void exportLegacy();
              }}
            >
              Exportar datos de la versión anterior
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Los datos anteriores se conservan separados porque no identifican a su propietario. La
              exportación incluye historias clínicas: guardala en un lugar privado.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Technical details about the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">App Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Database Version:</span>
                <span>1</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Environment:</span>
                <span>{process.env.NODE_ENV}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OfflineIndicator fixed={false} />
    </div>
  );
};

export default AdminDashboard;
