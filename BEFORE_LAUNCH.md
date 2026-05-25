# Before Public Launch

Technical debt and pilot-only shortcuts that **must be resolved before TADA accepts requests from real patients in production**. Each item is currently in place to keep development moving, but is unacceptable for a live emergency-response platform.

Add new items as they appear. Move to "Done" when resolved.

---

## 🔴 Critical — safety and trust

### 1. Replace direct phone dialing with number-masked calls

**Currently:** Both the patient and driver apps launch the native dialer/SMS composer with the other party's real number. See `apps/patient/src/lib/telephony.ts` and `apps/driver/src/lib/telephony.ts` (`launchDialer` / `launchSms`) and the `REPLACE BEFORE PRODUCTION` comment blocks.

**Why this is wrong for production:**
- Patient and paramedic learn each other's personal phone numbers
- Either party can call the other days, weeks, or years later — no way to revoke
- Real harassment risk in either direction
- When a paramedic leaves TADA, their personal number stays on hundreds of patient call histories

**What needs to change:**
- Set up Hubtel Voice (or alternative) — onboarding takes 2-3 weeks
- Register a TADA outbound number with NCA approval
- Build an Edge Function `bridge-call` that proxies both numbers through the TADA number
- Replace the `launchDialer()`/`launchSms()` calls (patient: `ambulance-found.tsx`, `tracking.tsx`; driver: `navigation.tsx`, `pickup.tsx`, `handover.tsx`) with `triggerProxyCall()` / `sendProxySms()` to the new endpoint
- Update both parties' understanding: they'll see a "TADA Emergency" call coming from a TADA number, not each other's phone

**Estimated effort:** 1 conversation once Hubtel Voice account is live.

### 2. Replace email/password auth with phone OTP

**Currently:** Email + password sign-in. Pilot test accounts use `*@tada.test` with shared password `TadaPilot2026!`.

**Why this is wrong for production:** Patients in Ghana use phone numbers, not emails. Field paramedics shouldn't have to memorize passwords. Shared passwords are an obvious security hole.

**What needs to change:** Real phone-OTP flow via Hubtel SMS (which we'd already started building before deferring), or upgrade Supabase to Pro and use their custom SMS provider webhook.

### 3. Delete all pilot test users from production database

Before pointing TADA at a production Supabase project, every `*@tada.test` user must be deleted. Production starts with zero users and accepts signups only through real phone-OTP.

### 4. Real authentication on the patient app

**Currently:** The OTP screen accepts the interim code `123456` as valid. See `INTERIM_VALID_CODE` in `apps/patient/app/otp.tsx`. Any other code shows an error but no real verification happens.

**What needs to change:** Hook the OTP screen up to the real `auth-otp-verify` Edge Function. Replace the placeholder check with a real Supabase session.

---

## 🟠 Important — data and personalization

### 5. Replace all hardcoded placeholder data with real queries

The patient app currently uses six categories of hardcoded data flagged with comments:

| Where | What | Replaces with |
|---|---|---|
| `home.tsx` `USER` | "Kofi Mensah", "+233 24 123 4567" | Logged-in patient's profile from `patients` table |
| `home.tsx` `STATS` | "12 nearby ambulances", "3-5 min avg" | Real-time count from Supabase + computed average |
| `home.tsx` `HAS_UNREAD_NOTIFICATIONS` | hardcoded `true` | Query against `notifications` table |
| `request.tsx` `PICKUP` | "Independence Avenue, Ridge" | Real GPS + reverse geocoding |
| `ambulance-found.tsx` `DRIVER` | Kwame Asante / Paramedic / 4.9 | Assigned driver's profile, threaded through trip params |
| `tracking.tsx` `TRIP` | Driver name, ETA, distance, emergency contact, pickup | Real trip record from `trips` table |

### 6. Live map screens

Currently placeholder cards on the Home screen (`Location Access`), the Request screen (map preview), the En Route screen (`View Live Tracking` shows an alert), and the **driver app's full-screen navigation** (`apps/driver/src/components/MapPlaceholder.tsx`, used by `navigation.tsx`). The driver's turn-by-turn directions are hardcoded and the speed readout is simulated. Need Google Maps SDK (`react-native-maps`) + Directions API wired up with proper API keys, plus live `expo-location` updates for the driver's position/speed and location-permissions handling.

### 7. Pre-provisioning UI for drivers/dispatchers/hospital staff

No admin interface yet. Non-patient roles must be created by running SQL migrations that know their phone numbers in advance. Build an admin screen (gated to `admin` role) for adding pre-provisioned users.

---

## 🟣 Driver app (pilot shortcuts)

### 15. Real driver authentication (Employee ID + PIN)

**Currently:** `apps/driver/app/login.tsx` accepts any non-empty Employee ID + any 4-digit PIN. No verification happens.

**What needs to change:** Back the login with Supabase auth + a `drivers` profile row keyed by the station-issued Employee ID. Drivers use ID + PIN rather than phone OTP because the device may be a shared in-vehicle tablet. Pre-provisioning of driver accounts ties into item 7.

### 16. Replace driver-app mock data with real queries

`apps/driver/src/lib/mockData.ts` is entirely hardcoded and flagged with a `REPLACE BEFORE PRODUCTION` block. Categories:

| Constant | What | Replaces with |
|---|---|---|
| `DRIVER` | Yaw Boateng, certs, ambulance, rating | Logged-in driver's `drivers` profile row |
| `INCOMING_REQUEST` | Patient snapshot + medical alerts + pickup | Realtime `trips` assignment joined to patient profile |
| `DESTINATION_HOSPITAL` / `DISPATCH` | Names + numbers | Assigned hospital row + dispatch config |
| `STATS` / `WEEKLY_BREAKDOWN` / `PAYMENT_SCHEDULE` | Trips, earnings, hours, payouts | Aggregated from `trips` + `payments` |
| `RECENT_RATINGS` | Feedback notes | `ratings` table for this driver |

### 17. Real request dispatch (replace the demo button)

**Currently:** The dashboard's "Simulate Incoming Request" button manually opens the request screen, and the Online/Offline toggle is local state only.

**What needs to change:** When the driver is online, write `status='available'` to Supabase; subscribe to a realtime channel so dispatch can push trip assignments. The 15-second accept timer should auto-decline back to dispatch for re-routing (the timer itself already works). Remove the demo button.

---

## 🟡 Compliance and operations

### 8. Database backups

Free-tier Supabase has no automated backups. Upgrade to Supabase Pro (daily backups, 7-day retention) or schedule manual `pg_dump` exports.

### 9. Penetration test / security review

At minimum: third-party review of auth flow, RLS policies, payment integration, location-tracking endpoints.

### 10. PII handling and consent

- Privacy policy + terms-of-service screens with explicit consent before location access
- Document data retention windows (trips, location history, medical profiles)
- Verify compliance with Ghana's Data Protection Act (Act 843)
- Build a "delete my account and data" flow

### 11. Hubtel SMS sender ID approval

`HUBTEL_SMS_SENDER_ID=TADA` needs registering with Hubtel and approval through Ghana MNOs (24-48 hours).

### 12. Real hospital and pricing data

Migration 008 seeds 3 placeholder hospitals with approximate coordinates and the planning-stage pricing (GH₵300 base / GH₵20/km / GH₵2/min). Verify all real hospital coordinates, phone numbers, capability flags. Confirm final pricing.

### 13. Google Maps API keys

Generate restricted keys per platform (Android, iOS, web). Restrict each to its bundle ID / domain. Enable Maps SDK, Directions, Distance Matrix, Geocoding, Places. Set up billing alerts.

### 14. Generated database types

`packages/shared/src/database.types.ts` is a hand-written stub. The Next.js Supabase clients had to drop their `Database` generic because of stub incompatibilities. Run `pnpm --filter @tada/shared generate-types` against production Supabase, then restore `createServerClient<Database>(...)` calls.

---

## ✅ Done

(Move items here as resolved.)
