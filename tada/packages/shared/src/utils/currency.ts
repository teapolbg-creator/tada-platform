/**
 * Currency utilities.
 *
 * INVARIANT: All money values stored and transmitted are in pesewas (integer).
 * Cedis (decimal) appear only at the display boundary.
 */

import { GHANA } from '../constants/ghana.js';
import { PRICING } from '../constants/pricing.js';

/**
 * Convert pesewas (integer) to cedis (number with at most 2 decimal places).
 * Use only for display — never store the result.
 */
export function pesewasToCedis(pesewas: number): number {
  if (!Number.isFinite(pesewas)) {
    throw new TypeError(`pesewasToCedis: expected a finite number, got ${pesewas}`);
  }
  return pesewas / PRICING.pesewasPerCedi;
}

/**
 * Convert cedis (decimal) to pesewas (integer). Rounds to the nearest pesewa.
 * Use when accepting user input.
 */
export function cedisToPesewas(cedis: number): number {
  if (!Number.isFinite(cedis)) {
    throw new TypeError(`cedisToPesewas: expected a finite number, got ${cedis}`);
  }
  return Math.round(cedis * PRICING.pesewasPerCedi);
}

export interface FormatCurrencyOptions {
  /** Include the GH₵ symbol. Default: true */
  withSymbol?: boolean;
  /** Show decimal places even when amount is a whole number. Default: true */
  alwaysShowDecimals?: boolean;
  /** Use compact notation for large amounts (1.2K, 1.5M). Default: false */
  compact?: boolean;
}

/**
 * Format a pesewas amount as a display string.
 *
 * formatCurrency(30000)                    => "GH₵300.00"
 * formatCurrency(30000, {withSymbol:false}) => "300.00"
 * formatCurrency(15050)                    => "GH₵150.50"
 * formatCurrency(0)                        => "GH₵0.00"
 */
export function formatCurrency(
  pesewas: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    withSymbol = true,
    alwaysShowDecimals = true,
    compact = false,
  } = options;

  const cedis = pesewasToCedis(pesewas);

  const formatter = new Intl.NumberFormat(GHANA.defaultLocale, {
    minimumFractionDigits: alwaysShowDecimals ? 2 : 0,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
  });

  const body = formatter.format(cedis);
  return withSymbol ? `${GHANA.currencySymbol}${body}` : body;
}

/**
 * Sum a list of pesewas amounts, returning a safe integer.
 * Useful for computing fare totals in UI without floating-point drift.
 */
export function sumPesewas(...amounts: Array<number | null | undefined>): number {
  let total = 0;
  for (const amount of amounts) {
    if (amount === null || amount === undefined) continue;
    if (!Number.isFinite(amount)) {
      throw new TypeError(`sumPesewas: encountered a non-finite value: ${amount}`);
    }
    total += Math.round(amount);
  }
  return total;
}

/**
 * Returns true if an amount is within plausible bounds for a single trip.
 * Defensive — protects against UI showing absurd fares due to a bug upstream.
 */
export function isReasonableTripFare(pesewas: number): boolean {
  return (
    Number.isFinite(pesewas) &&
    pesewas >= PRICING.absoluteMinimumPesewas &&
    pesewas <= PRICING.sanityMaximumPesewas
  );
}
