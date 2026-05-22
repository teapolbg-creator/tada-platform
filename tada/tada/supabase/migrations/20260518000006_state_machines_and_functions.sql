-- ============================================================================
-- TADA Migration 006: State Machines and Business Logic Functions
-- ============================================================================
-- Trip state transitions are enforced at the database level. The app layer
-- cannot bypass these rules. Same goes for fare calculation, dispatch logic,
-- and rating aggregation.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- get_user_role: cheap, indexed lookup used by RLS policies
-- ---------------------------------------------------------------------------
create or replace function public.get_user_role(uid uuid)
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = uid and is_active = true;
$$;

comment on function public.get_user_role is 'Returns active role for a user. Cached per-query by Postgres.';

-- ---------------------------------------------------------------------------
-- is_valid_trip_transition: gatekeeper for trip status changes
-- ---------------------------------------------------------------------------
create or replace function public.is_valid_trip_transition(
  current_status trip_status,
  new_status trip_status
)
returns boolean
language plpgsql
immutable
as $$
begin
  -- Same status = no transition, always allowed (idempotent updates)
  if current_status = new_status then
    return true;
  end if;

  -- Allowed forward transitions:
  if current_status = 'requested' and new_status in ('dispatching','cancelled_by_patient','cancelled_by_dispatcher','no_driver_found') then
    return true;
  elsif current_status = 'dispatching' and new_status in ('accepted','cancelled_by_patient','cancelled_by_dispatcher','no_driver_found') then
    return true;
  elsif current_status = 'accepted' and new_status in ('en_route_to_pickup','cancelled_by_patient','cancelled_by_dispatcher','driver_aborted') then
    return true;
  elsif current_status = 'en_route_to_pickup' and new_status in ('arrived_at_pickup','cancelled_by_patient','cancelled_by_dispatcher','driver_aborted') then
    return true;
  elsif current_status = 'arrived_at_pickup' and new_status in ('patient_onboard','cancelled_by_patient','cancelled_by_dispatcher','driver_aborted') then
    return true;
  elsif current_status = 'patient_onboard' and new_status in ('en_route_to_hospital','cancelled_by_dispatcher','driver_aborted') then
    return true;
  elsif current_status = 'en_route_to_hospital' and new_status in ('arrived_at_hospital','cancelled_by_dispatcher','driver_aborted') then
    return true;
  elsif current_status = 'arrived_at_hospital' and new_status = 'completed' then
    return true;
  end if;

  -- Anything else is an illegal transition
  return false;
end;
$$;

comment on function public.is_valid_trip_transition is 'Returns true if a trip can legally move from current_status to new_status.';

-- ---------------------------------------------------------------------------
-- enforce_trip_status_transition: BEFORE UPDATE trigger
-- ---------------------------------------------------------------------------
create or replace function public.enforce_trip_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if not public.is_valid_trip_transition(old.status, new.status) then
      raise exception 'illegal_trip_status_transition: % -> % (trip %)', old.status, new.status, old.id
        using errcode = 'P0001';
    end if;

    -- Auto-set the relevant timestamp:
    case new.status
      when 'dispatching' then new.dispatching_started_at := coalesce(new.dispatching_started_at, now());
      when 'accepted' then new.accepted_at := coalesce(new.accepted_at, now());
      when 'arrived_at_pickup' then new.driver_arrived_at_pickup_at := coalesce(new.driver_arrived_at_pickup_at, now());
      when 'patient_onboard' then new.patient_picked_up_at := coalesce(new.patient_picked_up_at, now());
      when 'arrived_at_hospital' then new.arrived_at_hospital_at := coalesce(new.arrived_at_hospital_at, now());
      when 'completed' then new.completed_at := coalesce(new.completed_at, now());
      when 'cancelled_by_patient' then new.cancelled_at := coalesce(new.cancelled_at, now());
      when 'cancelled_by_dispatcher' then new.cancelled_at := coalesce(new.cancelled_at, now());
      when 'no_driver_found' then new.cancelled_at := coalesce(new.cancelled_at, now());
      when 'driver_aborted' then new.cancelled_at := coalesce(new.cancelled_at, now());
      else null;
    end case;
  end if;

  return new;
end;
$$;

create trigger trg_trips_enforce_status_transition
  before update on public.trips
  for each row execute function public.enforce_trip_status_transition();

-- ---------------------------------------------------------------------------
-- log_trip_status_change: AFTER UPDATE trigger to append to trip_events
-- ---------------------------------------------------------------------------
create or replace function public.log_trip_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.trip_events (
      trip_id, event_type, from_status, to_status,
      actor_type, actor_user_id, payload
    ) values (
      new.id,
      'status_changed',
      old.status,
      new.status,
      coalesce(
        nullif(current_setting('app.actor_type', true), '')::actor_type,
        'system'
      ),
      auth.uid(),
      jsonb_build_object('reason', new.cancellation_reason)
    );
  end if;
  return new;
end;
$$;

create trigger trg_trips_log_status_change
  after update on public.trips
  for each row execute function public.log_trip_status_change();

-- ---------------------------------------------------------------------------
-- log_trip_created: AFTER INSERT trigger
-- ---------------------------------------------------------------------------
create or replace function public.log_trip_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.trip_events (
    trip_id, event_type, to_status, actor_type, actor_user_id, payload
  ) values (
    new.id,
    'trip_created',
    new.status,
    case
      when new.is_third_party_request then 'third_party'::actor_type
      else 'patient'::actor_type
    end,
    auth.uid(),
    jsonb_build_object('priority', new.priority, 'reference_code', new.reference_code)
  );
  return new;
end;
$$;

create trigger trg_trips_log_created
  after insert on public.trips
  for each row execute function public.log_trip_created();

-- ---------------------------------------------------------------------------
-- resolve_pricing_zone: finds the zone containing a point
-- ---------------------------------------------------------------------------
create or replace function public.resolve_pricing_zone(pickup geography)
returns uuid
language sql
stable
as $$
  select id from public.pricing_zones
  where is_active = true
    and (boundary is null or st_contains(boundary::geometry, pickup::geometry))
    and now() >= effective_from
    and (effective_to is null or now() < effective_to)
  order by boundary is null asc, st_area(boundary::geometry) asc
  limit 1;
$$;

comment on function public.resolve_pricing_zone is 'Returns the pricing zone containing the pickup point. Falls back to default catch-all zone.';

-- ---------------------------------------------------------------------------
-- calculate_trip_fare: computes the final fare in pesewas
-- ---------------------------------------------------------------------------
create or replace function public.calculate_trip_fare(trip_uuid uuid)
returns table (
  base_fare bigint,
  distance_fare bigint,
  time_fare bigint,
  services_fare bigint,
  surcharge bigint,
  total bigint
)
language plpgsql
stable
as $$
declare
  t public.trips%rowtype;
  zone public.pricing_zones%rowtype;
  v_base bigint := 0;
  v_distance bigint := 0;
  v_time bigint := 0;
  v_services bigint := 0;
  v_surcharge bigint := 0;
  v_subtotal bigint := 0;
  v_total bigint := 0;
  v_is_night boolean;
begin
  select * into t from public.trips where id = trip_uuid;
  if not found then
    raise exception 'trip_not_found: %', trip_uuid;
  end if;

  select * into zone from public.pricing_zones where id = t.pricing_zone_id;
  if not found then
    raise exception 'pricing_zone_not_found_for_trip: %', trip_uuid;
  end if;

  v_base := zone.base_fare_pesewas;

  if t.trip_distance_meters is not null then
    v_distance := (t.trip_distance_meters * zone.per_km_pesewas) / 1000;
  end if;

  if t.trip_duration_seconds is not null then
    v_time := (t.trip_duration_seconds * zone.per_minute_pesewas) / 60;
  end if;

  select coalesce(sum(price_pesewas * quantity), 0)
  into v_services
  from public.trip_services
  where trip_id = trip_uuid;

  v_subtotal := v_base + v_distance + v_time + v_services;

  -- Priority surcharge
  if t.priority = 'critical' then
    v_surcharge := v_surcharge + (v_subtotal * zone.critical_surcharge_pct) / 100;
  elsif t.priority = 'urgent' then
    v_surcharge := v_surcharge + (v_subtotal * zone.urgent_surcharge_pct) / 100;
  end if;

  -- Night surcharge (22:00–06:00 Africa/Accra)
  v_is_night := extract(hour from (t.requested_at at time zone 'Africa/Accra')) >= 22
                or extract(hour from (t.requested_at at time zone 'Africa/Accra')) < 6;
  if v_is_night then
    v_surcharge := v_surcharge + (v_subtotal * zone.night_surcharge_pct) / 100;
  end if;

  v_total := greatest(v_subtotal + v_surcharge, zone.minimum_fare_pesewas);

  return query select v_base, v_distance, v_time, v_services, v_surcharge, v_total;
end;
$$;

comment on function public.calculate_trip_fare is 'Computes all fare components for a trip. Pure function — does not write.';

-- ---------------------------------------------------------------------------
-- update_driver_metrics_on_trip_completion
-- ---------------------------------------------------------------------------
create or replace function public.update_driver_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' and new.driver_id is not null then
    update public.drivers
    set total_trips = total_trips + 1
    where user_id = new.driver_id;
  end if;

  if new.status in ('cancelled_by_patient','cancelled_by_dispatcher','driver_aborted')
     and old.status not in ('cancelled_by_patient','cancelled_by_dispatcher','driver_aborted','no_driver_found')
     and new.driver_id is not null
     and new.status = 'driver_aborted' then
    update public.drivers
    set cancellation_count = cancellation_count + 1
    where user_id = new.driver_id;
  end if;

  if new.patient_rating is not null and old.patient_rating is null and new.driver_id is not null then
    update public.drivers d
    set average_rating = (
      select avg(patient_rating)::numeric(3,2)
      from public.trips
      where driver_id = d.user_id and patient_rating is not null
    )
    where user_id = new.driver_id;
  end if;

  return new;
end;
$$;

create trigger trg_trips_update_driver_metrics
  after update on public.trips
  for each row execute function public.update_driver_metrics();

-- ---------------------------------------------------------------------------
-- auto_set_pricing_zone on insert
-- ---------------------------------------------------------------------------
create or replace function public.auto_set_pricing_zone()
returns trigger
language plpgsql
as $$
begin
  if new.pricing_zone_id is null then
    new.pricing_zone_id := public.resolve_pricing_zone(new.pickup_location);
  end if;
  return new;
end;
$$;

create trigger trg_trips_auto_set_pricing_zone
  before insert on public.trips
  for each row execute function public.auto_set_pricing_zone();
