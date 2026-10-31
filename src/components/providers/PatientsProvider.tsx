"use client";

import {createContext, useContext, useEffect, useState, useSyncExternalStore} from "react";

import {createClient} from "@/lib/supabase/client";
import {PatientDatabase} from "@/lib/patients/local";
import {
  createPatients,
  initialSnapshot,
  type Patients,
  type PatientSnapshot,
} from "@/lib/patients/module";
import {patientRemote} from "@/lib/patients/remote";

type ContextValue = PatientSnapshot &
  ({status: "loading" | "signed-out"; module: null} | {status: "authenticated"; module: Patients});
const PatientsContext = createContext<ContextValue | null>(null);

export function usePatients() {
  const context = useContext(PatientsContext);

  if (!context) throw new Error("usePatients requires PatientsProvider");

  return context;
}

function AccountPatients({userId, children}: {userId: string; children: React.ReactNode}) {
  const [module] = useState(() => {
    const local = new PatientDatabase(userId);

    return createPatients({
      local,
      remote: patientRemote(createClient(), userId),
      online: () => navigator.onLine,
      exclusive: async (run) => {
        if (!navigator.locks)
          throw new Error("Tu navegador no permite sincronizar de forma segura entre pestañas.");
        await navigator.locks.request(local.name, run);
      },
    });
  });
  const snapshot = useSyncExternalStore(
    module.subscribe,
    module.getSnapshot,
    () => initialSnapshot,
  );

  useEffect(() => module.start(), [module]);

  return (
    <PatientsContext.Provider value={{...snapshot, status: "authenticated", module}}>
      {children}
    </PatientsContext.Provider>
  );
}

export function PatientsProvider({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<{userId: string | null; ready: boolean}>({
    userId: null,
    ready: false,
  });

  useEffect(() => {
    const client = createClient();
    // INITIAL_SESSION also restores the cached session while offline.
    const {
      data: {subscription},
    } = client.auth.onAuthStateChange((_event, current) => {
      setSession({userId: current?.user.id ?? null, ready: true});
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session.userId) {
    return (
      <AccountPatients key={session.userId} userId={session.userId}>
        {children}
      </AccountPatients>
    );
  }

  return (
    <PatientsContext.Provider
      value={{
        ...initialSnapshot,
        ready: session.ready,
        status: session.ready ? "signed-out" : "loading",
        module: null,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export default PatientsProvider;
