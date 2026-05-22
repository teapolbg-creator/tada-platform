-- ============================================================================
-- TADA Migration 001: Extensions and Enum Types
-- ============================================================================
-- This migration sets up the foundational types and extensions used across
-- the entire schema. Run this FIRST, before any other migrations.
-- ============================================================================

-- PostGIS for geographic queries (find nearest ambulance, distance calcs, etc.)
create extension if not exists postgis;

-- For generating UUIDs in defaults
create extension if not exists "uuid-ossp";

-- For composite indexes on geography + other columns
create extension if not exists btree_gist;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
-- Using enums (not check constraints) because:
--   1. They're type-safe in generated TypeScript clients
--   2. They auto-document valid values
--   3. They're faster to compare than text with check constraints

-- The kind of user. One auth.users row can have ONE role profile.
-- (A person who is both a paramedic and a driver gets two phone numbers / two accounts.)
create type user_role as enum (
  'patient',
  'driver',
  'dispatcher',
  'hospital_staff',
  'admin'
);

-- Trip lifecycle. Order matters — these are the legal forward transitions.
-- Terminal states are listed at the end.
create type trip_status as enum (
  'requested',              -- patient/third-party tapped emergency, not yet seen by drivers
  'dispatching',            -- broadcast to nearby drivers, waiting for accept
  'accepted',               -- a driver accepted, has not started moving yet
  'en_route_to_pickup',     -- driver is moving toward patient
  'arrived_at_pickup',      -- driver tapped "I'm here"
  'patient_onboard',        -- patient confirmed loaded into ambulance
  'en_route_to_hospital',   -- moving toward destination hospital
  'arrived_at_hospital',    -- patient handed off to ER
  'completed',              -- payment settled, trip closed
  -- terminal failure / abort states:
  'cancelled_by_patient',
  'cancelled_by_dispatcher',
  'no_driver_found',
  'driver_aborted'
);

-- How urgent the trip is. Affects driver notification behavior and pricing surcharge.
-- Mapped to standard triage protocols (we'll seed real values in migration 003).
create type trip_priority as enum (
  'critical',   -- life-threatening: cardiac arrest, severe trauma, stroke, etc.
  'urgent',     -- serious but stable: fractures, moderate bleeding
  'standard',   -- non-life-threatening: scheduled transport, mild conditions
  'transfer'    -- inter-facility transfer, not an emergency
);

-- Driver availability. Drivers control their own status (except 'suspended').
create type driver_status as enum (
  'offline',     -- not accepting requests
  'available',   -- online and able to receive requests
  'on_trip',     -- actively working a trip; cannot accept new requests
  'on_break',    -- online but temporarily unavailable (lunch, fuel, etc.)
  'suspended'    -- disabled by admin; cannot go online until reinstated
);

-- Ambulance operational state. Driven by maintenance schedule + assignment.
create type ambulance_status as enum (
  'in_service',
  'in_maintenance',
  'retired'
);

-- Payment flow. We only support MoMo and cash in v1.
create type payment_method as enum (
  'mtn_momo',
  'vodafone_cash',
  'airteltigo_money',
  'cash',
  'card',            -- reserved for v2
  'institutional'    -- reserved for clinic/insurance billing in v2
);

create type payment_status as enum (
  'pending',     -- record created, not yet sent to provider
  'processing',  -- sent to Hubtel, awaiting callback
  'succeeded',
  'failed',
  'refunded',
  'cancelled'
);

-- Outbound notification channels.
create type notification_channel as enum (
  'sms',
  'push',
  'in_app'
);

create type notification_status as enum (
  'queued',
  'sent',
  'delivered',
  'failed'
);

-- Who or what triggered a trip event (for audit logs).
create type actor_type as enum (
  'patient',
  'driver',
  'dispatcher',
  'system',         -- automated state transition
  'third_party'     -- bystander or external caller
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
comment on type trip_status is 'Trip lifecycle. Forward transitions only; use trip_events for full audit history.';
comment on type trip_priority is 'Triage urgency. Affects driver alert sound, dispatch SLA, and pricing.';
comment on type driver_status is 'Driver availability. Drivers self-manage except suspended (admin-only).';
