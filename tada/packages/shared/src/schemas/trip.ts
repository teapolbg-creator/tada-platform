/**
 * Trip creation and triage schemas.
 * The Edge Function that creates a trip validates the input through these.
 */

import { z } from 'zod';
import { ghanaPhoneSchema, latLngInputSchema, nonEmptyString } from './common';

const EMERGENCY_TYPES = [
  'cardiac',
  'stroke',
  'trauma',
  'breathing',
  'bleeding',
  'seizure',
  'allergic_reaction',
  'burn',
  'pregnancy_labor',
  'poisoning',
  'psychiatric',
  'other',
] as const;

export const emergencyTypeSchema = z.enum(EMERGENCY_TYPES);

export const tripPrioritySchema = z.enum([
  'critical',
  'urgent',
  'standard',
  'transfer',
]);

/**
 * Initial trip creation. This is what the patient app POSTs when the user
 * taps "Request ambulance now". Triage details come later (optional).
 */
export const createTripSchema = z.object({
  /** The pickup location, captured from device GPS */
  pickupLocation: latLngInputSchema,
  pickupAddress: z.string().trim().max(500).optional(),
  pickupLandmark: z.string().trim().max(500).optional(),

  /** If the requester IS the patient, omit these third-party fields */
  isThirdPartyRequest: z.boolean().default(false),
  thirdPartyName: nonEmptyString(2, 200).optional(),
  thirdPartyPhone: ghanaPhoneSchema.optional(),
  thirdPartyRelationship: nonEmptyString(2, 100).optional(),

  /** Optional destination — dispatcher routes to nearest capable if omitted */
  destinationHospitalId: z.string().uuid().optional(),

  /** Optional priority hint — final priority resolved by dispatcher / triage */
  priorityHint: tripPrioritySchema.optional(),
}).refine(
  (data) => {
    // If third-party request, thirdPartyPhone is required
    if (data.isThirdPartyRequest) {
      return !!data.thirdPartyPhone;
    }
    return true;
  },
  {
    message: 'Third-party requests require a callback phone number',
    path: ['thirdPartyPhone'],
  }
);

export type CreateTripInput = z.infer<typeof createTripSchema>;

/**
 * Triage form. Can be submitted at any time before pickup, by the patient
 * or by the dispatcher during the automated call.
 */
export const triageFormSchema = z.object({
  tripId: z.string().uuid(),
  whoNeedsHelp: z
    .enum(['self', 'family_member', 'friend', 'stranger', 'colleague', 'other'])
    .optional(),
  patientAgeEstimate: z
    .number()
    .int()
    .min(0)
    .max(130)
    .optional(),
  patientGender: z
    .enum(['male', 'female', 'other', 'unknown'])
    .optional(),
  numberOfPatients: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(1),
  chiefComplaint: z.string().trim().max(1000).optional(),
  emergencyType: emergencyTypeSchema.optional(),
  isConscious: z.boolean().optional(),
  isBreathing: z.boolean().optional(),
  isBleeding: z.boolean().optional(),
  bleedingSeverity: z
    .enum(['minor', 'moderate', 'severe', 'massive'])
    .optional(),
  painLevel: z.number().int().min(0).max(10).optional(),
  symptoms: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  knownConditions: z.string().trim().max(2000).optional(),
  currentMedications: z.string().trim().max(2000).optional(),
  recentMeal: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type TriageFormInput = z.infer<typeof triageFormSchema>;

/**
 * Rating submitted after trip completion.
 */
export const tripRatingSchema = z.object({
  tripId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(1000).optional(),
});

export type TripRatingInput = z.infer<typeof tripRatingSchema>;

/**
 * Cancellation by patient.
 */
export const cancelTripByPatientSchema = z.object({
  tripId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
});

export type CancelTripByPatientInput = z.infer<typeof cancelTripByPatientSchema>;
