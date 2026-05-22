/**
 * Patient profile schemas. Used by the patient app onboarding and settings.
 */

import { z } from 'zod';
import {
  ghanaPhoneSchema,
  ghanaCardSchema,
  nonEmptyString,
} from './common.js';
import { SUPPORTED_LANGUAGES } from '../constants/ghana.js';

export const bloodTypeSchema = z.enum([
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'unknown',
]);

export const genderSchema = z.enum([
  'male',
  'female',
  'other',
  'prefer_not_to_say',
]);

/**
 * Emergency contact entry. Stored as JSONB on the patient row.
 */
export const emergencyContactSchema = z.object({
  name: nonEmptyString(2, 100),
  relationship: nonEmptyString(2, 50),
  phone: ghanaPhoneSchema,
});

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

/**
 * Patient profile creation / update. All fields except full_name are optional
 * for fast onboarding — the user can fill medical details later from settings.
 */
export const patientProfileSchema = z.object({
  fullName: nonEmptyString(2, 200),
  dateOfBirth: z
    .string()
    .date()
    .optional()
    .nullable(),
  gender: genderSchema.optional().nullable(),
  bloodType: bloodTypeSchema.optional().nullable(),
  allergies: z.string().trim().max(2000).optional().nullable(),
  chronicConditions: z.string().trim().max(2000).optional().nullable(),
  currentMedications: z.string().trim().max(2000).optional().nullable(),
  ghanaCardNumber: ghanaCardSchema.optional().nullable(),
  preferredLanguage: z
    .enum(
      Object.keys(SUPPORTED_LANGUAGES) as [
        keyof typeof SUPPORTED_LANGUAGES,
        ...Array<keyof typeof SUPPORTED_LANGUAGES>,
      ]
    )
    .default('en'),
  emergencyContacts: z
    .array(emergencyContactSchema)
    .max(5, 'Up to 5 emergency contacts')
    .default([]),
});

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
