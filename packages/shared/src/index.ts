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

export * from './database.types';
export * from './constants/index';
export * from './utils/index';
export * from './schemas/index';
export * from './domain/index';
