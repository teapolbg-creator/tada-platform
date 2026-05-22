# @tada/shared

The shared TypeScript layer for the TADA platform. Every app — patient, driver, dispatcher, hospital — and every Edge Function imports from this package.

## What's in here

| Path | Purpose |
|---|---|
| `src/database.types.ts` | Generated types matching the Supabase schema. Regenerate when migrations change. |
| `src/constants/` | Ghana-specific reference data: mobile networks, regions, languages, triage protocol, pricing. |
| `src/utils/` | Pure functions: currency, phone, distance, time, trip-status. Used by every UI. |
| `src/schemas/` | Zod validation schemas for every form and API input. |
| `src/domain/` | Rich business models that wrap raw database rows with computed fields. |

## How apps import from it

```ts
// Anywhere in an app:
import {
  formatCurrency,
  normalizeGhanaPhone,
  createTripSchema,
  toTripDomain,
  TRIP_STATUS_LABELS,
  GHANA,
} from '@tada/shared';

formatCurrency(30000);                    // "GH₵300.00"
normalizeGhanaPhone('024 123 4567');      // "+233241234567"
createTripSchema.parse(formInput);        // validates + transforms
toTripDomain(tripRow);                    // rich UI model
TRIP_STATUS_LABELS.en_route_to_pickup;    // "Driver en route"
GHANA.timezone;                           // "Africa/Accra"
```

## Critical conventions

**Money is always pesewas.** Internally, transmitted, stored — every money field is an integer number of pesewas (1 cedi = 100 pesewas). Cedis appear only at the display layer, via `formatCurrency()`. Never store the result of `pesewasToCedis()`.

**Phones are E.164 in storage, formatted at display.** Database stores `+233241234567`. UI displays via `formatPhoneForDisplay()`. Input fields run through `normalizeGhanaPhone()` before submission. The Zod schemas do this automatically.

**Status transitions go through the validator.** Before any app or Edge Function updates a trip's status, call `isValidTripTransition(from, to)`. The database also enforces this — see migration 006 — but checking in the app gives instant UI feedback.

**Geographic data is GeoJSON Point.** `{ type: 'Point', coordinates: [longitude, latitude] }`. Note the order: longitude first, latitude second. Use `makeGeoPoint(lat, lng)` to construct safely.

## Regenerating database types

The hand-written `database.types.ts` is a stub. Once your Supabase project is live and the migrations have been applied, replace it with the real generated types:

```bash
# One time: install Supabase CLI
npm install -g supabase

# Set your project ID (find it in Supabase dashboard URL)
export SUPABASE_PROJECT_ID=abcdefghij1234567890

# Generate
pnpm --filter @tada/shared generate-types
```

The script defined in `package.json` does this. The output replaces `src/database.types.ts` entirely.

## Smoke test

The package ships with `smoke-test.ts` — a runnable script that exercises every key function and prints pass/fail. Run after any meaningful change:

```bash
cd packages/shared
npx tsx smoke-test.ts
```

Expected output ends with `42 passed, 0 failed`.

## Adding a new schema

When you need to validate a new form or API input:

1. Add the schema to the appropriate file in `src/schemas/` (or create a new one).
2. Use the primitives in `common.ts` (`ghanaPhoneSchema`, `nonEmptyString`, `uuidSchema`, etc.) — don't reinvent.
3. Export from `src/schemas/index.ts`.
4. Add a smoke-test case to `smoke-test.ts` that exercises both a valid and invalid input.
5. Use it in both the app form (via `react-hook-form` + `@hookform/resolvers/zod`) AND the Edge Function (`schema.parse(req.body)`).

## Adding a new utility

Same pattern — pure functions in `src/utils/`, smoke-tested, used everywhere.
