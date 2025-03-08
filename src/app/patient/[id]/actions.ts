"use server";

import {createClient} from "@/utils/supabase/server";

const processFormData = (formData: FormData) => {
  const processedData: Record<string, FormDataEntryValue> = {};

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("$ACTION_ID")) {
      processedData[key] = value;
    }
  }

  return processedData;
};

export async function postClient(formData: FormData) {
  const supabase = await createClient();

  const parsedFormData = processFormData(formData);
  // Calculate age but don't include it in the database record
  // since the age column no longer exists

  const newPatient = {
    ...parsedFormData,
  };

  const {data, error} = await supabase.from("patients").insert(newPatient).select();

  if (error) {
    console.error("Error saving patient:", error);
    throw new Error(`Failed to save patient: ${error.message}`);
  }

  return data;
}
