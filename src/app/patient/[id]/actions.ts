"use server";

import {createClient} from "@/utils/supabase/server";

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Check if the birthday has occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

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
  const age = calculateAge(formData.get("dob") as string);

  const newPatient = {
    age,
    ...parsedFormData,
  };

  const savedPatient = await supabase.from("patients").insert(newPatient);

  return;
}
