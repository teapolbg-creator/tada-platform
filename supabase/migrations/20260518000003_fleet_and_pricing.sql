-- ============================================================================
-- TADA Migration 003: Fleet, Pricing, and Service Catalog
-- ============================================================================

-- ---------------------------------------------------------------------------
-- AMBULANCES
-- ---------------------------------------------------------------------------
-- Vehicles. A driver is assigned ONE ambulance at a time (drivers.current_ambulance_id).
-- An ambulance serves ANY hospital — no exclusivity per the operating model.
create table public.ambulances (
  id uuid primary key default uuid_generate_v4(),
  vehicle_registration text unique not null,
  call_sign text unique not null,
  -- Type drives pricing tier and capability:
  vehicle_type text not null check (vehicle_type in ('basic_life_support','advanced_life_support','patient_transport','neonatal')),
  make text,
  model text,
  year int,
  -- Operational state:
  status ambulance_status not null default 'in_service',
  -- Equipment inventory as JSONB so we can evolve without migrations:
  equipment jsonb not null default '{}'::jsonb,
  -- equipment shape: {oxygen: true, defibrillator: true, ventilator: false, ...}
  -- Owner (for accounting; can be TADA, a hospital, or a contractor):
  owner_type text not null default 'tada' check (owner_type in ('tada','hospital','contractor')),
  owner_hospital_id uuid references public.hospitals(id),
  -- Maintenance:
  last_service_date date,
  next_service_due date,
  insurance_expiry date,
  -- Audit:
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.ambulances is 'Vehicles. Decoupled from drivers — drivers can switch ambulances between shifts.';
comment on column public.ambulances.equipment is 'JSONB inventory. Used by dispatcher to match ambulance capability to triage.';

create index idx_ambulances_status on public.ambulances(status) where deleted_at is null;

-- Now we can add the FK from drivers.current_ambulance_id (deferred from migration 002):
alter table public.drivers
  add constraint drivers_current_ambulance_fk
  foreign key (current_ambulance_id) references public.ambulances(id) on delete set null;

create trigger trg_ambulances_updated_at before update on public.ambulances
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- PRICING ZONES
-- ---------------------------------------------------------------------------
-- Pricing varies by service area. Tema pilot = one zone. Schema supports many
-- for nationwide rollout (Accra zone, Kumasi zone, etc.).
create table public.pricing_zones (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  -- Boundary as a polygon — pickup location is matched to the containing zone:
  boundary geography(Polygon, 4326),
  -- All money in pesewas (integer). 1 GHS = 100 pesewas.
  base_fare_pesewas bigint not null check (base_fare_pesewas >= 0),
  per_km_pesewas bigint not null check (per_km_pesewas >= 0),
  per_minute_pesewas bigint not null check (per_minute_pesewas >= 0),
  minimum_fare_pesewas bigint not null check (minimum_fare_pesewas >= 0),
  -- Priority surcharges (percent, 0–100):
  critical_surcharge_pct int not null default 0 check (critical_surcharge_pct between 0 and 100),
  urgent_surcharge_pct int not null default 0 check (urgent_surcharge_pct between 0 and 100),
  -- Night surcharge (10pm–6am):
  night_surcharge_pct int not null default 0 check (night_surcharge_pct between 0 and 100),
  -- Cancellation fee (charged if patient cancels after driver accepts):
  cancellation_fee_pesewas bigint not null default 0 check (cancellation_fee_pesewas >= 0),
  is_active boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pricing_zones is 'Geographic pricing tiers. Trip is priced by zone containing pickup point.';
comment on column public.pricing_zones.boundary is 'PostGIS polygon. Null boundary = catch-all default zone.';

create index idx_pricing_zones_boundary on public.pricing_zones using gist(boundary) where is_active = true;

create trigger trg_pricing_zones_updated_at before update on public.pricing_zones
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- SERVICE CATALOG
-- ---------------------------------------------------------------------------
-- Onboard services that can be added to a trip (oxygen, splinting, defib use, etc.).
-- Dispatcher or driver adds these to a trip; they roll into the final fare.
create table public.service_catalog (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,  -- e.g. 'OXY', 'SPLINT', 'DEFIB'
  name text not null,
  description text,
  category text not null check (category in ('medical_procedure','equipment_use','medication','consumable','additional_personnel')),
  base_price_pesewas bigint not null check (base_price_pesewas >= 0),
  -- Some services require justification or paramedic certification:
  requires_paramedic boolean not null default false,
  requires_consent boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.service_catalog is 'Add-on services billed per trip (oxygen, defib, IV, etc.).';

create index idx_service_catalog_active on public.service_catalog(is_active) where is_active = true;

create trigger trg_service_catalog_updated_at before update on public.service_catalog
  for each row execute function public.set_updated_at();
