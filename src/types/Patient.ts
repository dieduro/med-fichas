export interface Patient {
  id?: string;
  full_name: string;
  age?: number;
  lastVisit?: string;
  email: string;
  phone_number: string;
  gender: string;
  dob: string;
  notes: string;
  health_insurance?: string;
  user_id?: string;
}
