"use client";

import React from "react";
import Link from "next/link";

import SyncControls from "./ui/SyncControls";
import {Button} from "./ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

import {clearLocalPatients} from "@/lib/localStorageService";

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <SyncControls />

        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>Manage local patient data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="destructive" onClick={clearLocalPatients}>
              Clear Local Patients
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Warning: This will delete all locally stored patient data. This action cannot be
              undone.
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
    </div>
  );
};

export default AdminDashboard;
