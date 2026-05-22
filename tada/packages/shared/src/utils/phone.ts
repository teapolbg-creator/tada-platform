/**
 * Ghanaian phone number parsing and formatting.
 *
 * We accept many input formats:
 *   "0241234567", "+233241234567", "233241234567", "24 123 4567", "(024) 123 4567"
 *
 * We store a single canonical form in the database:
 *   "+233241234567"  (E.164)
 *
 * We detect mobile network from the prefix to pick the right MoMo provider.
 */

import { GHANA, MOBILE_NETWORKS, type MobileNetworkCode } from '../constants/ghana.js';

const NON_DIGIT = /\D/g;

/**
 * Strip all non-digit characters and return the digit-only string.
 */
function digitsOnly(input: string): string {
  return input.replace(NON_DIGIT, '');
}

/**
 * Parse any reasonable Ghanaian phone number representation into its
 * canonical E.164 form, or null if invalid.
 *
 * normalizeGhanaPhone("024 123 4567")       => "+233241234567"
 * normalizeGhanaPhone("+233 24 123 4567")   => "+233241234567"
 * normalizeGhanaPhone("233241234567")       => "+233241234567"
 * normalizeGhanaPhone("12345")              => null
 */
export function normalizeGhanaPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = digitsOnly(input);

  // Strip leading country code if present
  if (digits.startsWith(GHANA.callingCode)) {
    digits = digits.slice(GHANA.callingCode.length);
  }

  // Strip leading 0 (the trunk prefix used domestically)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // After stripping, a valid Ghanaian mobile/landline is exactly 9 digits
  if (digits.length !== 9) return null;

  // First digit can't be 0 (we already stripped the trunk)
  if (digits.startsWith('0')) return null;

  return `+${GHANA.callingCode}${digits}`;
}

/**
 * Returns true if the input parses to a valid Ghanaian phone number.
 */
export function isValidGhanaPhone(input: string | null | undefined): boolean {
  return normalizeGhanaPhone(input) !== null;
}

/**
 * Detect which mobile network owns a phone number. Only works for normalized
 * E.164 input (use normalizeGhanaPhone first).
 *
 * detectMobileNetwork("+233241234567") => "mtn"
 * detectMobileNetwork("+233201234567") => "vodafone"
 * detectMobileNetwork("+233271234567") => "airteltigo"
 * detectMobileNetwork("not a number")  => null
 */
export function detectMobileNetwork(
  e164: string | null | undefined
): MobileNetworkCode | null {
  const normalized = normalizeGhanaPhone(e164);
  if (!normalized) return null;

  // After "+233", the next 2 digits are the network prefix
  const prefix = normalized.slice(4, 6);

  for (const [code, network] of Object.entries(MOBILE_NETWORKS)) {
    if ((network.prefixes as readonly string[]).includes(prefix)) {
      return code as MobileNetworkCode;
    }
  }

  return null;
}

/**
 * Format an E.164 number for display.
 *
 * formatPhoneForDisplay("+233241234567")              => "+233 24 123 4567"
 * formatPhoneForDisplay("+233241234567", {local:true}) => "024 123 4567"
 */
export function formatPhoneForDisplay(
  e164: string | null | undefined,
  options: { local?: boolean } = {}
): string {
  if (!e164) return '';
  const normalized = normalizeGhanaPhone(e164);
  if (!normalized) return e164;

  const digits = normalized.slice(4); // strip +233
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 5);
  const part3 = digits.slice(5);

  if (options.local) {
    return `0${part1} ${part2} ${part3}`;
  }
  return `+${GHANA.callingCode} ${part1} ${part2} ${part3}`;
}

/**
 * Mask a phone number for display in contexts where the full number shouldn't
 * be shown (e.g. driver app showing only the last 4 digits of the patient's
 * callback number).
 *
 * maskPhone("+233241234567") => "+233 ** *** 4567"
 */
export function maskPhone(e164: string | null | undefined): string {
  const normalized = normalizeGhanaPhone(e164);
  if (!normalized) return '';
  const last4 = normalized.slice(-4);
  return `+${GHANA.callingCode} ** *** ${last4}`;
}
