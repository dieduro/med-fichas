"use client";

import {useEffect, useState} from "react";

import AdminDashboard from "./AdminDashboard";
import Dashboard from "./Dashboard";
import PatientDetails from "./PatientDetails";

// Every patient URL can use the same precached shell, including unvisited URLs.
export default function PatientApp() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  if (path === null) return <p>Cargando...</p>;
  if (path === "/admin" || path === "/admin/") return <AdminDashboard />;
  const match = /^\/patient\/([^/]+)\/?$/.exec(path);

  if (match) return <PatientDetails id={match[1]} />;

  return <Dashboard />;
}
