-- ============================================================================
-- TADA Migration 005: Notifications and Supporting Tables
-- ============================================================================

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
-- Outbound messages to users across SMS, push, and in-app channels.
-- Created by Edge Functions when trip events fire; status updated by webhook
-- callbacks from Hubtel (SMS) and Expo Push (push).
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  channel notification_channel not null,
  status notification_status not null default 'queued',
  -- Content:
  template_code text not null,  -- e.g. 'TRIP_ACCEPTED_PATIENT'
  title text,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  -- Channel-specific delivery details:
  recipient_phone text,                   -- for SMS
  recipient_push_token text,              -- for push
  provider_message_id text,               -- Hubtel/Expo message ID
  provider_response jsonb,
  -- Lifecycle:
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  retry_count int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'Outbound notifications. One row per channel per recipient per event.';

create index idx_notifications_user on public.notifications(user_id, created_at desc);
create index idx_notifications_trip on public.notifications(trip_id) where trip_id is not null;
create index idx_notifications_queued on public.notifications(scheduled_for) where status = 'queued';
create index idx_notifications_status on public.notifications(status) where status in ('queued','sent');

-- ---------------------------------------------------------------------------
-- PUSH_TOKENS
-- ---------------------------------------------------------------------------
-- Expo push tokens per user device. A user can have multiple devices.
create table public.push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text unique not null,
  device_id text,
  device_name text,
  platform text check (platform in ('ios','android')),
  app_variant text not null check (app_variant in ('patient','driver','dispatcher','hospital')),
  is_active boolean not null default true,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.push_tokens is 'Per-device push notification tokens. Multiple devices per user allowed.';

create index idx_push_tokens_user on public.push_tokens(user_id) where is_active = true;

-- ---------------------------------------------------------------------------
-- DRIVER_REQUESTS (the dispatch broadcast log)
-- ---------------------------------------------------------------------------
-- When a trip is dispatched, it's offered to one or more drivers. This table
-- tracks each offer and the driver's response. Critical for v2 auto-matching.
create table public.driver_requests (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  driver_id uuid not null references public.drivers(user_id) on delete cascade,
  -- Offer state:
  offered_at timestamptz not null default now(),
  expires_at timestamptz not null,  -- typically offered_at + 15 seconds
  response text not null default 'pending' check (response in ('pending','accepted','declined','expired','cancelled')),
  responded_at timestamptz,
  decline_reason text,
  -- Distance/ETA snapshot at offer time:
  distance_to_pickup_meters int,
  estimated_eta_seconds int,
  unique (trip_id, driver_id)
);

comment on table public.driver_requests is 'One row per (trip, driver) offer. Tracks acceptance race for self-accept model.';

create index idx_driver_requests_trip on public.driver_requests(trip_id, response);
create index idx_driver_requests_driver_pending on public.driver_requests(driver_id) where response = 'pending';

-- ---------------------------------------------------------------------------
-- TRIP_NOTES (free-form comms between dispatcher, driver, hospital)
-- ---------------------------------------------------------------------------
create table public.trip_notes (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_user_id uuid not null references auth.users(id),
  author_role user_role not null,
  visible_to user_role[] not null default array['dispatcher','driver','hospital_staff']::user_role[],
  body text not null,
  created_at timestamptz not null default now()
);

comment on table public.trip_notes is 'Operational notes between operations roles. Patient-visible if "patient" included in visible_to.';

create index idx_trip_notes_trip on public.trip_notes(trip_id, created_at);
