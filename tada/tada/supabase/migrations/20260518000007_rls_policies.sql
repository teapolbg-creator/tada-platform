-- ============================================================================
-- TADA Migration 007: Row Level Security Policies
-- ============================================================================
-- RLS is THE security boundary. Every table has it enabled. Every policy is
-- explicit. The service_role bypasses RLS — Edge Functions use it for
-- privileged operations like creating trips, sending notifications, etc.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------
alter table public.user_roles enable row level security;
alter table public.patients enable row level security;
alter table public.drivers enable row level security;
alter table public.dispatchers enable row level security;
alter table public.hospitals enable row level security;
alter table public.hospital_staff enable row level security;
alter table public.ambulances enable row level security;
alter table public.pricing_zones enable row level security;
alter table public.service_catalog enable row level security;
alter table public.trips enable row level security;
alter table public.trip_events enable row level security;
alter table public.trip_locations enable row level security;
alter table public.trip_services enable row level security;
alter table public.triage_records enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;
alter table public.driver_requests enable row level security;
alter table public.trip_notes enable row level security;

-- ---------------------------------------------------------------------------
-- USER_ROLES: users see their own role; admins see everything
-- ---------------------------------------------------------------------------
create policy "users read own role"
  on public.user_roles for select
  using (user_id = auth.uid());

create policy "admins manage all roles"
  on public.user_roles for all
  using (public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- PATIENTS: own profile only; drivers see sanitized snapshot via trips
-- ---------------------------------------------------------------------------
create policy "patients read own profile"
  on public.patients for select
  using (user_id = auth.uid());

create policy "patients update own profile"
  on public.patients for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "patients insert own profile"
  on public.patients for insert
  with check (user_id = auth.uid());

create policy "dispatchers read all patients"
  on public.patients for select
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

-- ---------------------------------------------------------------------------
-- DRIVERS: own profile; dispatcher reads all; patients see assigned driver only via trips
-- ---------------------------------------------------------------------------
create policy "drivers read own profile"
  on public.drivers for select
  using (user_id = auth.uid());

create policy "drivers update own profile"
  on public.drivers for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      status is not distinct from (select status from public.drivers where user_id = auth.uid())
      or status != 'suspended'
    )
  );

create policy "dispatchers read all drivers"
  on public.drivers for select
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

create policy "dispatchers update driver suspension"
  on public.drivers for update
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

-- ---------------------------------------------------------------------------
-- DISPATCHERS: self-read; admin manages
-- ---------------------------------------------------------------------------
create policy "dispatchers read own profile"
  on public.dispatchers for select
  using (user_id = auth.uid());

create policy "admins manage dispatchers"
  on public.dispatchers for all
  using (public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- HOSPITALS: readable by all authenticated users (used in dropdowns, maps)
-- ---------------------------------------------------------------------------
create policy "authenticated read hospitals"
  on public.hospitals for select
  to authenticated
  using (is_active = true);

create policy "admins manage hospitals"
  on public.hospitals for all
  using (public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- HOSPITAL_STAFF: own profile + hospital colleagues
-- ---------------------------------------------------------------------------
create policy "hospital staff read own"
  on public.hospital_staff for select
  using (user_id = auth.uid());

create policy "hospital staff read colleagues"
  on public.hospital_staff for select
  using (
    hospital_id in (
      select hospital_id from public.hospital_staff where user_id = auth.uid()
    )
  );

create policy "dispatchers read all hospital staff"
  on public.hospital_staff for select
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

create policy "admins manage hospital staff"
  on public.hospital_staff for all
  using (public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- AMBULANCES: readable by all authenticated; managed by admin/dispatcher
-- ---------------------------------------------------------------------------
create policy "authenticated read ambulances"
  on public.ambulances for select
  to authenticated
  using (deleted_at is null);

create policy "dispatchers manage ambulances"
  on public.ambulances for all
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

-- ---------------------------------------------------------------------------
-- PRICING_ZONES and SERVICE_CATALOG: readable by all authenticated
-- ---------------------------------------------------------------------------
create policy "authenticated read pricing zones"
  on public.pricing_zones for select
  to authenticated
  using (is_active = true);

create policy "admins manage pricing zones"
  on public.pricing_zones for all
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "authenticated read service catalog"
  on public.service_catalog for select
  to authenticated
  using (is_active = true);

create policy "admins manage service catalog"
  on public.service_catalog for all
  using (public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- TRIPS: the most security-critical table
-- ---------------------------------------------------------------------------
-- Patient sees their own trips (whether they're patient_id or requested_by)
create policy "patients read own trips"
  on public.trips for select
  using (
    patient_id = auth.uid()
    or requested_by_user_id = auth.uid()
  );

create policy "patients insert own trips"
  on public.trips for insert
  with check (
    (patient_id = auth.uid() and is_third_party_request = false)
    or (requested_by_user_id = auth.uid() and is_third_party_request = true)
  );

create policy "patients update own pending trips"
  on public.trips for update
  using (
    (patient_id = auth.uid() or requested_by_user_id = auth.uid())
    and status in ('requested','dispatching','accepted','en_route_to_pickup')
  )
  with check (
    patient_id = auth.uid() or requested_by_user_id = auth.uid()
  );

-- Driver sees assigned trips + currently-offered trips
create policy "drivers read assigned and offered trips"
  on public.trips for select
  using (
    driver_id = auth.uid()
    or id in (
      select trip_id from public.driver_requests
      where driver_id = auth.uid() and response = 'pending' and expires_at > now()
    )
  );

create policy "drivers update assigned trips"
  on public.trips for update
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

-- Dispatcher sees everything
create policy "dispatchers read all trips"
  on public.trips for select
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

create policy "dispatchers update all trips"
  on public.trips for update
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

-- Hospital staff see trips destined for or arrived at their hospital
create policy "hospital staff read incoming trips"
  on public.trips for select
  using (
    hospital_id in (
      select hospital_id from public.hospital_staff where user_id = auth.uid() and deleted_at is null
    )
  );

-- ---------------------------------------------------------------------------
-- TRIP_EVENTS: read access mirrors trips; inserts via triggers only
-- ---------------------------------------------------------------------------
create policy "read trip events for accessible trips"
  on public.trip_events for select
  using (
    trip_id in (select id from public.trips)  -- RLS on trips filters this
  );

-- ---------------------------------------------------------------------------
-- TRIP_LOCATIONS: high-frequency table; restricted access
-- ---------------------------------------------------------------------------
create policy "read trip locations for accessible trips"
  on public.trip_locations for select
  using (
    trip_id in (select id from public.trips)
  );

create policy "drivers insert locations for own trips"
  on public.trip_locations for insert
  with check (
    trip_id in (select id from public.trips where driver_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- TRIP_SERVICES: drivers and dispatchers add; everyone with trip access reads
-- ---------------------------------------------------------------------------
create policy "read trip services for accessible trips"
  on public.trip_services for select
  using (trip_id in (select id from public.trips));

create policy "drivers and dispatchers add services"
  on public.trip_services for insert
  with check (
    public.get_user_role(auth.uid()) in ('driver','dispatcher','admin')
    and trip_id in (select id from public.trips)
  );

-- ---------------------------------------------------------------------------
-- TRIAGE_RECORDS
-- ---------------------------------------------------------------------------
create policy "read triage for accessible trips"
  on public.triage_records for select
  using (trip_id in (select id from public.trips));

create policy "insert triage for accessible trips"
  on public.triage_records for insert
  with check (trip_id in (select id from public.trips));

create policy "update triage before pickup"
  on public.triage_records for update
  using (
    trip_id in (
      select id from public.trips
      where status in ('requested','dispatching','accepted','en_route_to_pickup','arrived_at_pickup')
    )
  );

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------
create policy "read payments for accessible trips"
  on public.payments for select
  using (trip_id in (select id from public.trips));

create policy "dispatchers manage payments"
  on public.payments for all
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS: users read their own
-- ---------------------------------------------------------------------------
create policy "users read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "users update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- PUSH_TOKENS: users manage their own
-- ---------------------------------------------------------------------------
create policy "users manage own push tokens"
  on public.push_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- DRIVER_REQUESTS: drivers see their own; dispatchers see all
-- ---------------------------------------------------------------------------
create policy "drivers read own requests"
  on public.driver_requests for select
  using (driver_id = auth.uid());

create policy "drivers respond to own requests"
  on public.driver_requests for update
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

create policy "dispatchers manage all driver requests"
  on public.driver_requests for all
  using (public.get_user_role(auth.uid()) in ('dispatcher','admin'));

-- ---------------------------------------------------------------------------
-- TRIP_NOTES: visibility per visible_to array
-- ---------------------------------------------------------------------------
create policy "read trip notes per role visibility"
  on public.trip_notes for select
  using (
    trip_id in (select id from public.trips)
    and public.get_user_role(auth.uid()) = any(visible_to)
  );

create policy "operations roles add notes"
  on public.trip_notes for insert
  with check (
    public.get_user_role(auth.uid()) in ('dispatcher','driver','hospital_staff','admin')
    and author_user_id = auth.uid()
  );
