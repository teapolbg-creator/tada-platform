/**
 * Patient domain model.
 */

import type { PatientRow } from '../database.types.js';
import { z } from 'zod';
import { emergencyContactSchema } from '../schemas/patient.js';

export interface PatientDomain {
  userId: string;
  fullName: string;
  dateOfBirth: string | null;
  age: number | null;
  bloodType: PatientRow['blood_type'];
  hasMedicalProfile: boolean;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  preferredLanguage: string;
}

const emergencyContactsArraySchema = z.array(emergencyContactSchema);

export function toPatientDomain(row: PatientRow): PatientDomain {
  const parsed = emergencyContactsArraySchema.safeParse(row.emergency_contacts);
  const contacts = parsed.success ? parsed.data : [];

  return {
    userId: row.user_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    age: row.date_of_birth ? computeAge(row.date_of_birth) : null,
    bloodType: row.blood_type,
    hasMedicalProfile: Boolean(
      row.blood_type ||
        row.allergies ||
        row.chronic_conditions ||
        row.current_medications
    ),
    emergencyContacts: contacts,
    preferredLanguage: row.preferred_language,
  };
}

function computeAge(isoDate: string): number {
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age;
}
