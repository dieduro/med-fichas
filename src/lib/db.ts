// lib/api.js
import {getSupabaseAdmin} from "./supabaseClient";

import {Patient} from "@/types/Patient";
import {createClient} from "@/utils/supabase/client";
// Function to determine if we're on the server or client
const isServer = () => typeof window === "undefined";

// Since createClient from server is now async, we need to handle it differently
// For client-side, we can still use the synchronous client
const clientSideSupabase = typeof window !== "undefined" ? createClient() : null;

export const api = {
  getPatients: async () => {
    let client;

    if (isServer()) {
      client = await getSupabaseAdmin();
    } else {
      // If we're on the client side but clientSideSupabase is null, create it
      client = clientSideSupabase || createClient();
    }

    const {data, error} = await client
      .from("patients")
      .select("*")
      .order("created_at", {ascending: false});

    if (error) throw error;

    return data;
  },
  // User related queries
  getPatient: async (patientId: string) => {
    let client;

    if (isServer()) {
      client = await getSupabaseAdmin();
    } else {
      // If we're on the client side but clientSideSupabase is null, create it
      client = clientSideSupabase || createClient();
    }

    const {data, error} = await client.from("patients").select("*").eq("id", patientId).single();

    if (error) throw error;

    return data;
  },

  createPatient: async (patient: Patient) => {
    const client = await getSupabaseAdmin();
    const {data, error} = await client.from("posts").insert(patient);

    if (error) throw error;

    return data;
  },
};
