/**
 * Authentication schemas. Used by all four apps' login flows.
 */

import { z } from 'zod';
import { ghanaPhoneSchema, otpCodeSchema, nonEmptyString } from './common.js';

/**
 * Step 1 of phone OTP login: request a code.
 */
export const otpRequestSchema = z.object({
  phone: ghanaPhoneSchema,
  /** Which app the user is signing into — affects SMS template and post-login routing */
  appVariant: z.enum(['patient', 'driver', 'dispatcher', 'hospital']),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

/**
 * Step 2: verify the 6-digit code.
 */
export const otpVerifySchema = z.object({
  phone: ghanaPhoneSchema,
  code: otpCodeSchema,
});

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

/**
 * Driver and dispatcher login alternative — employee ID + PIN.
 * Per the user flow docs, drivers use ID + PIN in addition to phone.
 */
export const employeeLoginSchema = z.object({
  employeeId: nonEmptyString(3, 50),
  pin: z
    .string()
    .regex(/^\d{4}$/, { message: 'PIN must be 4 digits' }),
});

export type EmployeeLoginInput = z.infer<typeof employeeLoginSchema>;
