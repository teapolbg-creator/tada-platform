/**
 * @tada/shared — root barrel
 *
 * Apps should import from the top-level package:
 *
 *   import { formatCurrency, createTripSchema, toTripDomain } from '@tada/shared';
 *
 * Or, for tree-shaking-friendly imports, from a sub-path:
 *
 *   import { formatCurrency } from '@tada/shared/utils';
 *   import { createTripSchema } from '@tada/shared/schemas';
 */

export * from './database.types.js';
export * from './constants/index.js';
export * from './utils/index.js';
export * from './schemas/index.js';
export * from './domain/index.js';
