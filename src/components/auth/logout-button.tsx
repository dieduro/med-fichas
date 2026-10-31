"use client";

import {useState} from "react";
import {toast} from "sonner";

import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const logout = async () => {
    setPending(true);
    try {
      const {error} = await createClient().auth.signOut();

      if (error) throw error;
      window.location.assign("/login");
    } catch {
      toast.error("No se pudo cerrar la sesión. Verificá tu conexión e intentá nuevamente.");
      setPending(false);
    }
  };

  return (
    <Button
      disabled={pending}
      size="sm"
      variant="outline"
      onClick={() => {
        void logout();
      }}
    >
      {pending ? "Cerrando sesión..." : "Logout"}
    </Button>
  );
}
