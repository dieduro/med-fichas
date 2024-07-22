// lib/api.js
import {supabaseAdmin} from "./supabaseClient";

import {Patient} from "@/types/Patient";
import {createClient} from "@/utils/supabase/client";
// Function to determine if we're on the server or client
const isServer = () => typeof window === "undefined";
const supabase = createClient();

export const api = {
  getPatients: async () => {
    const client = isServer() ? supabaseAdmin : supabase;
    const {data, error} = await client
      .from("patients")
      .select("*")
      .order("created_at", {ascending: false})
      .limit(25);

    if (error) {
      console.log(888, error);
      throw error;
    }

    return data;
  },
  // User related queries
  getPatient: async (patientId: string) => {
    const client = isServer() ? supabaseAdmin : supabase;
    const {data, error} = await client.from("patients").select("*").eq("id", patientId).single();

    if (error) throw error;

    return data;
  },

  createPatient: async (patient: Patient) => {
    const client = supabaseAdmin || supabase;
    const {data, error} = await client.from("posts").insert(patient);

    if (error) throw error;

    return data;
  },
};
