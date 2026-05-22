/**
 * Reusable schema primitives for Ghanaian inputs.
 * Imported by every other schema module.
 */

import { z } from 'zod';
import {
  normalizeGhanaPhone,
  isValidGhanaPhone,
  detectMobileNetwork,
} from '../utils/phone.js';

/**
 * Accept any reasonable Ghanaian phone input. After parsing, the value is
 * normalized to E.164 ("+233...").
 */
export const ghanaPhoneSchema = z
  .string()
  .min(9, 'Phone number too short')
  .max(20, 'Phone number too long')
  .refine(isValidGhanaPhone, {
    message: 'Enter a valid Ghanaian phone number',
  })
  .transform((value) => normalizeGhanaPhone(value)!);

/**
 * MoMo number = a Ghanaian phone number that maps to a known network.
 * After parsing, the value is normalized and the detected network is available
 * via parseMomoNumber below.
 */
export const momoNumberSchema = ghanaPhoneSchema.refine(
  (e164) => detectMobileNetwork(e164) !== null,
  {
    message: 'This number is not associated with a recognised mobile network',
  }
);

/**
 * Parse a MoMo number and return the normalized form + detected network.
 * Throws on invalid input — use safeParse in UI code.
 */
export function parseMomoNumber(input: string): {
  e164: string;
  network: 'mtn' | 'vodafone' | 'airteltigo';
} {
  const e164 = momoNumberSchema.parse(input);
  const network = detectMobileNetwork(e164);
  if (!network) {
    throw new Error('Network detection failed after validation — inconsistent state');
  }
  return { e164, network };
}

/**
 * Ghana Card number.
 * Format: GHA-NNNNNNNNN-N (3-letter prefix, 9 digits, 1 check digit).
 * Source: National Identification Authority (NIA).
 */
export const ghanaCardSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^GHA-\d{9}-\d$/, {
    message: 'Ghana Card number must look like GHA-123456789-0',
  });

/**
 * 6-digit OTP code from SMS.
 */
export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: 'Enter the 6-digit code' });

/**
 * GeoJSON Point input. Apps capture lat/lng from device GPS and pass it
 * through this schema before sending to the backend.
 */
export const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z
    .tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ])
    .describe('[longitude, latitude] — GeoJSON order, NOT [lat, lng]'),
});

/**
 * Helper to build a geoPoint from raw lat/lng input.
 */
export const latLngInputSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .transform((value) => ({
    type: 'Point' as const,
    coordinates: [value.longitude, value.latitude] as [number, number],
  }));

/**
 * Money input — must be a non-negative integer in pesewas.
 */
export const pesewasSchema = z
  .number()
  .int('Amount must be in whole pesewas')
  .nonnegative('Amount cannot be negative')
  .max(10_000_000, 'Amount exceeds maximum'); // GH₵100,000 sanity cap

/**
 * UUID — for foreign key references.
 */
export const uuidSchema = z.string().uuid('Invalid identifier');

/**
 * ISO 8601 timestamp.
 */
export const isoTimestampSchema = z.string().datetime({ offset: true });

/**
 * Trimmed non-empty string of a bounded length.
 */
export function nonEmptyString(min = 1, max = 500) {
  return z
    .string()
    .trim()
    .min(min, `Must be at least ${min} character${min === 1 ? '' : 's'}`)
    .max(max, `Must be at most ${max} characters`);
}
