import {Patient} from "@/types/Patient";

const STORAGE_KEY = "offlinePatients";

export const savePatientLocally = (patient: Patient): void => {
  console.log("Saving patient to local storage:", patient);
  try {
    const patients = getLocalPatients();

    if (patients.find((p) => p.id === patient.id)) {
      updatePatientLocally(patient);

      return;
    }

    const updatedPatients = [...patients, patient];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));
  } catch (error) {
    console.error("Error saving patient to local storage:", error);
    throw new Error("Failed to save patient locally");
  }
};

export const getLocalPatients = (): Patient[] => {
  try {
    const patientsJson = localStorage.getItem(STORAGE_KEY);

    return patientsJson ? JSON.parse(patientsJson) : [];
  } catch (error) {
    console.error("Error retrieving patients from local storage:", error);

    return [];
  }
};

export const getLocalPatientById = (id: string): Patient | undefined => {
  try {
    const patientsJson = getLocalPatients();

    return patientsJson.find((patient) => patient.id === id);
  } catch (error) {
    console.error("Error retrieving patients from local storage:", error);

    return undefined;
  }
};

export const clearLocalPatients = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing patients from local storage:", error);
    throw new Error("Failed to clear local patients");
  }
};

export const updatePatientLocally = (updatedPatient: Patient): void => {
  try {
    const patients = getLocalPatients();
    const updatedPatients = patients.map((patient) =>
      patient.id === updatedPatient.id ? updatedPatient : patient,
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));
  } catch (error) {
    console.error("Error updating patient in local storage:", error);
    throw new Error("Failed to update patient locally");
  }
};

export const deletePatientLocally = (patientId: string): void => {
  try {
    const patients = getLocalPatients();
    const updatedPatients = patients.filter((patient) => patient.id !== patientId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));
  } catch (error) {
    console.error("Error deleting patient from local storage:", error);
    throw new Error("Failed to delete patient locally");
  }
};
