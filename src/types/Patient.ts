import {z} from "zod";

export const patientDraftSchema = z.object({
  full_name: z.string().trim().min(1, "Ingresá el nombre del paciente"),
  email: z.string().trim().email("Email inválido").or(z.literal("")),
  phone_number: z.string(),
  gender: z.enum(["male", "female", "other", ""]),
  dob: z.iso.date("Fecha de nacimiento inválida").or(z.literal("")),
  notes: z.string(),
  health_insurance: z.string(),
});

export const patientSchema = patientDraftSchema.extend({id: z.string().uuid()});

export type PatientDraft = z.infer<typeof patientDraftSchema>;

export type Patient = z.infer<typeof patientSchema>;
