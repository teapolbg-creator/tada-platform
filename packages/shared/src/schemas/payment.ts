/**
 * Payment schemas. The Edge Function that initiates a MoMo charge through
 * Hubtel validates input through these.
 */

import { z } from 'zod';
import { momoNumberSchema, pesewasSchema } from './common';

export const paymentMethodSchema = z.enum([
  'mtn_momo',
  'vodafone_cash',
  'airteltigo_money',
  'cash',
  'card',
  'institutional',
]);

/**
 * Initiate MoMo charge. The Edge Function looks up the trip, validates the
 * caller has access to it, then calls Hubtel.
 */
export const initiateMomoPaymentSchema = z.object({
  tripId: z.string().uuid(),
  /** Network detected from the number — we still trust client input but verify */
  momoNumber: momoNumberSchema,
  /**
   * Amount to charge. Must match the trip's total_fare_pesewas (or a partial
   * payment if we ever support that). Edge Function verifies.
   */
  amountPesewas: pesewasSchema.min(100, 'Minimum charge is GH₵1'),
});

export type InitiateMomoPaymentInput = z.infer<typeof initiateMomoPaymentSchema>;

/**
 * Cash collection — recorded by driver after the patient pays cash on arrival.
 */
export const recordCashPaymentSchema = z.object({
  tripId: z.string().uuid(),
  amountPesewas: pesewasSchema.min(100),
});

export type RecordCashPaymentInput = z.infer<typeof recordCashPaymentSchema>;
