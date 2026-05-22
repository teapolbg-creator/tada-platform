/**
 * Driver-side schemas.
 */

import { z } from 'zod';
import {
  ghanaPhoneSchema,
  ghanaCardSchema,
  nonEmptyString,
  momoNumberSchema,
  latLngInputSchema,
} from './common';
import { paymentMethodSchema } from './payment';

/**
 * Driver onboarding / profile update.
 */
export const driverProfileSchema = z.object({
  fullName: nonEmptyString(2, 200),
  licenseNumber: nonEmptyString(3, 50),
  licenseExpiry: z.string().date(),
  paramedicCert: z.string().trim().max(100).optional().nullable(),
  paramedicCertExpiry: z.string().date().optional().nullable(),
  ghanaCardNumber: ghanaCardSchema,
  dateOfBirth: z.string().date(),
  emergencyContactName: nonEmptyString(2, 200).optional().nullable(),
  emergencyContactPhone: ghanaPhoneSchema.optional().nullable(),
  payoutMethod: paymentMethodSchema.optional().nullable(),
  payoutMomoNumber: momoNumberSchema.optional().nullable(),
});

export type DriverProfileInput = z.infer<typeof driverProfileSchema>;

/**
 * Driver status update — toggling online/offline/break.
 * Note: 'suspended' is admin-only; the driver schema enum excludes it.
 */
export const driverStatusUpdateSchema = z.object({
  status: z.enum(['offline', 'available', 'on_break']),
});

export type DriverStatusUpdateInput = z.infer<typeof driverStatusUpdateSchema>;

/**
 * Driver location ping. Sent every ~5 seconds while online.
 */
export const driverLocationPingSchema = z.object({
  location: latLngInputSchema,
  headingDegrees: z.number().min(0).max(360).optional(),
  speedKmh: z.number().min(0).max(300).optional(),
  accuracyMeters: z.number().min(0).max(10_000).optional(),
});

export type DriverLocationPingInput = z.infer<typeof driverLocationPingSchema>;

/**
 * Driver responds to a dispatch offer.
 */
export const driverRespondToRequestSchema = z.object({
  driverRequestId: z.string().uuid(),
  response: z.enum(['accepted', 'declined']),
  declineReason: z.string().trim().max(200).optional(),
});

export type DriverRespondToRequestInput = z.infer<typeof driverRespondToRequestSchema>;

/**
 * Driver adds a service to a trip (onboard procedure, medication, etc.).
 */
export const addTripServiceSchema = z.object({
  tripId: z.string().uuid(),
  serviceId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
  notes: z.string().trim().max(500).optional(),
});

export type AddTripServiceInput = z.infer<typeof addTripServiceSchema>;

/**
 * Driver transitions trip status.
 */
export const driverAdvanceTripStatusSchema = z.object({
  tripId: z.string().uuid(),
  toStatus: z.enum([
    'en_route_to_pickup',
    'arrived_at_pickup',
    'patient_onboard',
    'en_route_to_hospital',
    'arrived_at_hospital',
    'driver_aborted',
  ]),
  abortReason: z.string().trim().max(500).optional(),
});

export type DriverAdvanceTripStatusInput = z.infer<typeof driverAdvanceTripStatusSchema>;
