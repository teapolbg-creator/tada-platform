-- ============================================================================
-- TADA Migration 002: Identity & Profile Tables
-- ============================================================================
-- Supabase manages auth.users (phone OTP). Each user has ONE role profile.
-- All profile tables key off auth.users.id (PK = FK pattern).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- USER ROLES (the join from auth.users → role)
-- ---------------------------------------------------------------------------
-- We could store role in user_metadata, but a dedicated table:
--   1. Lets us index it
--   2. Lets us enforce constraints via FK
--   3. Survives auth provider changes
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_roles is 'Single role per user. Determines which profile table to read.';

create index idx_user_roles_role on public.user_roles(role) where is_active = true;

-- ---------------------------------------------------------------------------
-- PATIENT PROFILES
-- ---------------------------------------------------------------------------
-- PII lives here. The patient app reads its own row; the driver/dispatcher
-- read sanitized subsets via views.
create table public.patients (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_type text check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  allergies text,
  chronic_conditions text,
  current_medications text,
  emergency_contacts jsonb not null default '[]'::jsonb,
  -- emergency_contacts shape: [{name, relationship, phone}, ...]
  ghana_card_number text,
  preferred_language text not null default 'en' check (preferred_language in ('en','tw','ga','ee','ha')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.patients is 'Patient profile. PII — protected by RLS, never returned in raw form to drivers.';
comment on column public.patients.emergency_contacts is 'JSONB array: [{name, relationship, phone}]. Validated at app layer.';

create index idx_patients_active on public.patients(user_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- DRIVER PROFILES
-- ---------------------------------------------------------------------------
-- Drivers are independent contractors (per our model). last_location is updated
-- frequently while online — we index it spatially for "nearest available" queries.
create table public.drivers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  license_number text unique not null,
  license_expiry date not null,
  paramedic_cert text,
  paramedic_cert_expiry date,
  ghana_card_number text unique not null,
  date_of_birth date not null,
  emergency_contact_name text,
  emergency_contact_phone text,
  -- Current operational state (controlled by the driver app):
  status driver_status not null default 'offline',
  last_location geography(Point, 4326),
  last_location_at timestamptz,
  -- Currently-assigned ambulance (a driver can be reassigned between shifts):
  current_ambulance_id uuid,
  -- Performance:
  total_trips int not null default 0,
  cancellation_count int not null default 0,
  average_rating numeric(3,2),
  -- Payout details (MoMo number, for paying drivers their share):
  payout_method payment_method,
  payout_momo_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.drivers is 'Independent-contractor drivers. Updated frequently for live tracking.';
comment on column public.drivers.last_location is 'PostGIS point. Updated every 5–10s while status = available or on_trip.';

create index idx_drivers_available_location on public.drivers using gist(last_location)
  where status = 'available' and deleted_at is null;
create index idx_drivers_status on public.drivers(status) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- DISPATCHERS
-- ---------------------------------------------------------------------------
-- v1 has ONE dispatcher account but the schema supports multiple from day one.
create table public.dispatchers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  employee_id text unique not null,
  shift_pattern text,
  is_on_shift boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.dispatchers is 'TADA dispatch operators. v1 = one account, schema supports many.';

-- ---------------------------------------------------------------------------
-- HOSPITALS
-- ---------------------------------------------------------------------------
-- The destinations. Indexed spatially because dispatcher will route to nearest
-- capable hospital when patient/triage doesn't specify one.
create table public.hospitals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  short_name text,
  hospital_type text not null check (hospital_type in ('public','private','teaching','clinic','specialist')),
  address text not null,
  city text not null default 'Tema',
  region text not null default 'Greater Accra',
  location geography(Point, 4326) not null,
  main_phone text not null,
  emergency_phone text,
  -- Capabilities — drives routing intelligence in v2:
  has_emergency_room boolean not null default true,
  has_trauma_center boolean not null default false,
  has_stroke_unit boolean not null default false,
  has_cardiac_unit boolean not null default false,
  has_pediatric_er boolean not null default false,
  has_maternity boolean not null default false,
  -- Operational:
  is_partner boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hospitals is 'Receiving facilities. is_partner=true for hospitals with signed agreements (Tema pilot).';

create index idx_hospitals_location on public.hospitals using gist(location) where is_active = true;
create index idx_hospitals_partner on public.hospitals(is_partner) where is_active = true;

-- ---------------------------------------------------------------------------
-- HOSPITAL STAFF
-- ---------------------------------------------------------------------------
-- ER doctors, nurses, charge nurses with dashboard access.
create table public.hospital_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete restrict,
  full_name text not null,
  staff_role text not null check (staff_role in ('er_doctor','er_nurse','charge_nurse','admin','triage_nurse')),
  staff_id text not null,
  is_on_shift boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (hospital_id, staff_id)
);

comment on table public.hospital_staff is 'Hospital ER staff with dashboard access. Scoped to one hospital.';

create index idx_hospital_staff_hospital on public.hospital_staff(hospital_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- updated_at trigger function (shared)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_user_roles_updated_at before update on public.user_roles
  for each row execute function public.set_updated_at();
create trigger trg_patients_updated_at before update on public.patients
  for each row execute function public.set_updated_at();
create trigger trg_drivers_updated_at before update on public.drivers
  for each row execute function public.set_updated_at();
create trigger trg_dispatchers_updated_at before update on public.dispatchers
  for each row execute function public.set_updated_at();
create trigger trg_hospitals_updated_at before update on public.hospitals
  for each row execute function public.set_updated_at();
create trigger trg_hospital_staff_updated_at before update on public.hospital_staff
  for each row execute function public.set_updated_at();
