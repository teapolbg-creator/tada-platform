/**
 * Pricing constants. Everything money-related uses pesewas internally;
 * cedis appear only at the display layer.
 */

export const PRICING = {
  /** 1 cedi = 100 pesewas */
  pesewasPerCedi: 100,

  /** Smallest amount we ever charge (defensive — DB also enforces minimum_fare_pesewas) */
  absoluteMinimumPesewas: 100, // GH₵1

  /** Maximum any single trip should plausibly cost. Anything above this triggers a warning. */
  sanityMaximumPesewas: 200_000, // GH₵2,000

  /** Window in which a patient can cancel without fee (after request, before driver accepts) */
  freeCancellationWindowSeconds: 60,
} as const;
