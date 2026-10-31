import type {SupabaseClient} from "@supabase/supabase-js";
import type {PatientRemote} from "./module";

import {z} from "zod";

import {patientSchema, type Patient} from "@/types/Patient";

const remotePatientSchema = patientSchema.extend({
  email: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  phone_number: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  notes: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  dob: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  gender: z
    .enum(["male", "female", "other", ""])
    .nullish()
    .transform((value) => value ?? ""),
  health_insurance: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
});

export function patientRemote(client: SupabaseClient, userId: string): PatientRemote {
  const verifySession = async () => {
    const {data, error} = await client.auth.getUser();

    if (error || data.user?.id !== userId) {
      throw new Error("Iniciá sesión nuevamente para sincronizar tus cambios.");
    }
  };

  return {
    async list() {
      await verifySession();
      const patients: Patient[] = [];
      let lastId: string | undefined;

      while (true) {
        let query = client
          .from("patients")
          .select("*")
          .eq("user_id", userId)
          .order("id")
          .limit(500);

        if (lastId) query = query.gt("id", lastId);
        const {data, error} = await query;

        if (error) throw new Error(error.message);
        const page = z.array(remotePatientSchema).parse(data);

        patients.push(...page);
        const last = page.at(-1);

        if (!last) return patients;
        // Continue until an empty page, including projects with a lower server-side row limit.
        lastId = last.id;
      }
    },
    async save(patient) {
      await verifySession();
      const {data, error} = await client
        .from("patients")
        .upsert({
          ...patient,
          dob: patient.dob || null,
          gender: patient.gender || null,
          user_id: userId,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      if (data?.id !== patient.id) throw new Error("El servidor no confirmó el guardado");
    },
    async remove(id) {
      await verifySession();
      const {error} = await client.from("patients").delete().eq("id", id).eq("user_id", userId);

      if (error) throw new Error(error.message);
    },
  };
}
