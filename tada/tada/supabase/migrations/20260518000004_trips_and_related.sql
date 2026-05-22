-- ============================================================================
-- TADA Migration 004: Trips and Related Tables
-- ============================================================================
-- The TRIPS table is the spine of the entire platform. Every screen in every
-- app reads from or writes to this table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TRIPS
-- ---------------------------------------------------------------------------
create table public.trips (
  id uuid primary key default uuid_generate_v4(),
  -- Human-readable reference (for SMS, voice calls, hospital comms):
  reference_code text unique not null default ('TADA-' || upper(substring(uuid_generate_v4()::text, 1, 6))),

  -- Who requested it
  patient_id uuid references public.patients(user_id) on delete restrict,
  -- Third-party caller info (when requester is not the patient):
  requested_by_user_id uuid references auth.users(id),
  is_third_party_request boolean not null default false,
  third_party_name text,
  third_party_phone text,
  third_party_relationship text,

  -- Who's handling it
  driver_id uuid references public.drivers(user_id),
  ambulance_id uuid references public.ambulances(id),
  dispatcher_id uuid references public.dispatchers(user_id),  -- which dispatcher handled

  -- Destination
  hospital_id uuid references public.hospitals(id),

  -- State
  status trip_status not null default 'requested',
  priority trip_priority not null default 'standard',

  -- Locations (PostGIS)
  pickup_location geography(Point, 4326) not null,
  pickup_address text,
  pickup_landmark text,           -- "near Tema Community 2 traffic light"
  destination_location geography(Point, 4326),
  destination_address text,

  -- Patient info at time of request (denormalized for speed, NOT identity):
  patient_name_snapshot text,     -- name at time of trip (handles renames)
  patient_phone_snapshot text,    -- callback number for driver

  -- Pricing zone (resolved at trip creation, stays constant):
  pricing_zone_id uuid references public.pricing_zones(id),

  -- Computed distances and times (filled progressively):
  estimated_pickup_distance_meters int,
  estimated_pickup_eta_seconds int,
  actual_pickup_distance_meters int,
  actual_pickup_duration_seconds int,
  trip_distance_meters int,
  trip_duration_seconds int,

  -- Fare components (all in pesewas, all nullable until trip ends):
  base_fare_pesewas bigint,
  distance_fare_pesewas bigint,
  time_fare_pesewas bigint,
  services_fare_pesewas bigint,
  surcharge_pesewas bigint,
  discount_pesewas bigint default 0,
  total_fare_pesewas bigint,

  -- Cancellation tracking:
  cancellation_reason text,
  cancellation_actor actor_type,

  -- Rating (filled after completion):
  patient_rating int check (patient_rating between 1 and 5),
  patient_review text,

  -- Timestamps for every major lifecycle moment.
  -- These are denormalized from trip_events for fast querying, but trip_events
  -- remains the source of truth for the full audit trail.
  requested_at timestamptz not null default now(),
  dispatching_started_at timestamptz,
  accepted_at timestamptz,
  driver_arrived_at_pickup_at timestamptz,
  patient_picked_up_at timestamptz,
  arrived_at_hospital_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,

  -- Audit:
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.trips is 'THE central entity. Every app reads/writes this. Status transitions enforced by trigger.';
comment on column public.trips.reference_code is 'Human-readable ID for phone calls and SMS (e.g. TADA-A3F2B1).';
comment on column public.trips.patient_name_snapshot is 'Denormalized for speed and for cases where patient_id is null (anonymous third-party requests).';

-- Indexes for hot query paths:
create index idx_trips_status on public.trips(status) where status not in ('completed','cancelled_by_patient','cancelled_by_dispatcher','no_driver_found','driver_aborted');
create index idx_trips_driver on public.trips(driver_id, status);
create index idx_trips_patient on public.trips(patient_id, requested_at desc);
create index idx_trips_hospital_incoming on public.trips(hospital_id, status) 
  where status in ('en_route_to_hospital','patient_onboard','arrived_at_pickup','en_route_to_pickup');
create index idx_trips_dispatcher_queue on public.trips(status, priority, requested_at)
  where status in ('requested','dispatching','accepted');
create index idx_trips_pickup_location on public.trips using gist(pickup_location);
create index idx_trips_requested_at on public.trips(requested_at desc);

create trigger trg_trips_updated_at before update on public.trips
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- TRIP_EVENTS (the audit log)
-- ---------------------------------------------------------------------------
-- Append-only log of every state change, action, and notable event on a trip.
-- This is what NAS would audit when reviewing an incident.
create table public.trip_events (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  event_type text not null,
  -- Event types include: status_changed, location_updated, message_sent,
  -- call_initiated, service_added, payment_attempted, note_added, etc.
  from_status trip_status,
  to_status trip_status,
  actor_type actor_type not null,
  actor_user_id uuid references auth.users(id),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.trip_events is 'Append-only audit log. Every state change, location update, and action.';

create index idx_trip_events_trip on public.trip_events(trip_id, occurred_at);
create index idx_trip_events_type on public.trip_events(event_type, occurred_at);

-- ---------------------------------------------------------------------------
-- TRIP_LOCATIONS (the breadcrumb trail)
-- ---------------------------------------------------------------------------
-- High-frequency location pings from the driver during a trip. Used for live
-- tracking by patient & dispatcher, and post-hoc route reconstruction.
create table public.trip_locations (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  location geography(Point, 4326) not null,
  heading_degrees numeric(5,2),       -- 0–360, direction of travel
  speed_kmh numeric(5,2),
  accuracy_meters numeric(6,2),
  recorded_at timestamptz not null default now()
);

comment on table public.trip_locations is 'Driver GPS breadcrumbs. Throttled to ~1 ping per 3-5 seconds during active trips.';

-- BRIN index because this table grows huge but queries are always range-scanned by trip_id + time
create index idx_trip_locations_trip_time on public.trip_locations(trip_id, recorded_at);
create index idx_trip_locations_recorded_brin on public.trip_locations using brin(recorded_at);

-- ---------------------------------------------------------------------------
-- TRIP_SERVICES (onboard services billed per trip)
-- ---------------------------------------------------------------------------
create table public.trip_services (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  service_id uuid not null references public.service_catalog(id) on delete restrict,
  -- Price snapshot at time of use (catalog price may change later):
  price_pesewas bigint not null check (price_pesewas >= 0),
  quantity int not null default 1 check (quantity > 0),
  notes text,
  added_by_user_id uuid references auth.users(id),
  added_at timestamptz not null default now()
);

comment on table public.trip_services is 'Add-on services applied to a trip. Price snapshotted to prevent post-hoc rate changes.';

create index idx_trip_services_trip on public.trip_services(trip_id);

-- ---------------------------------------------------------------------------
-- TRIAGE_RECORDS
-- ---------------------------------------------------------------------------
-- Captured triage information. Either filled by patient via the optional triage
-- form, or by the dispatcher over the automated call, or by the driver at pickup.
create table public.triage_records (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null unique references public.trips(id) on delete cascade,
  -- Who's the patient (if not the requester):
  who_needs_help text check (who_needs_help in ('self','family_member','friend','stranger','colleague','other')),
  patient_age_estimate int,
  patient_gender text,
  number_of_patients int not null default 1 check (number_of_patients > 0),
  -- Clinical:
  chief_complaint text,
  emergency_type text check (emergency_type in (
    'cardiac','stroke','trauma','breathing','bleeding','seizure','allergic_reaction',
    'burn','pregnancy_labor','poisoning','psychiatric','other'
  )),
  is_conscious boolean,
  is_breathing boolean,
  is_bleeding boolean,
  bleeding_severity text check (bleeding_severity in ('minor','moderate','severe','massive')),
  pain_level int check (pain_level between 0 and 10),
  symptoms jsonb not null default '[]'::jsonb,
  known_conditions text,
  current_medications text,
  recent_meal text,
  -- Triage outcome:
  recommended_priority trip_priority,
  notes text,
  -- Audit:
  completed_by_user_id uuid references auth.users(id),
  completed_by_role user_role,
  completed_at timestamptz not null default now()
);

comment on table public.triage_records is 'Clinical triage info. Updateable until pickup, then immutable for compliance.';

create index idx_triage_trip on public.triage_records(trip_id);

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null unique references public.trips(id) on delete restrict,
  method payment_method not null,
  status payment_status not null default 'pending',
  amount_pesewas bigint not null check (amount_pesewas >= 0),
  -- Provider details (Hubtel):
  provider text not null default 'hubtel',
  provider_transaction_id text unique,
  provider_response jsonb,
  -- For MoMo:
  momo_number text,
  momo_network text check (momo_network in ('mtn','vodafone','airteltigo')),
  -- For cash:
  cash_collected_by_user_id uuid references auth.users(id),
  -- Lifecycle:
  initiated_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  -- Refunds:
  refunded_amount_pesewas bigint not null default 0,
  refunded_at timestamptz,
  refund_reason text,
  -- Audit:
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.payments is 'One payment record per trip. Status transitions tracked; refunds tracked inline.';

create index idx_payments_status on public.payments(status) where status in ('pending','processing');
create index idx_payments_provider_txn on public.payments(provider_transaction_id);

create trigger trg_payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
