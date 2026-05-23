/**
 * TADA Database Types
 *
 * ⚠️  THIS FILE IS AUTO-GENERATED. Do not edit by hand.
 *
 * Regenerate when the schema changes:
 *   pnpm --filter @tada/shared generate-types
 *
 * This stub provides the most-used types so the package compiles before the
 * Supabase CLI has been pointed at your project. Replace this entire file
 * with the output of `supabase gen types typescript`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// ENUM types — mirror migration 001 exactly. Updated by hand until typegen runs.
// ---------------------------------------------------------------------------

export type UserRole =
  | 'patient'
  | 'driver'
  | 'dispatcher'
  | 'hospital_staff'
  | 'admin';

export type TripStatus =
  | 'requested'
  | 'dispatching'
  | 'accepted'
  | 'en_route_to_pickup'
  | 'arrived_at_pickup'
  | 'patient_onboard'
  | 'en_route_to_hospital'
  | 'arrived_at_hospital'
  | 'completed'
  | 'cancelled_by_patient'
  | 'cancelled_by_dispatcher'
  | 'no_driver_found'
  | 'driver_aborted';

export type TripPriority = 'critical' | 'urgent' | 'standard' | 'transfer';

export type DriverStatus =
  | 'offline'
  | 'available'
  | 'on_trip'
  | 'on_break'
  | 'suspended';

export type AmbulanceStatus = 'in_service' | 'in_maintenance' | 'retired';

export type PaymentMethod =
  | 'mtn_momo'
  | 'vodafone_cash'
  | 'airteltigo_money'
  | 'cash'
  | 'card'
  | 'institutional';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type NotificationChannel = 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export type ActorType =
  | 'patient'
  | 'driver'
  | 'dispatcher'
  | 'system'
  | 'third_party';

// ---------------------------------------------------------------------------
// Geography — PostGIS values come back as GeoJSON Point objects
// ---------------------------------------------------------------------------

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

// ---------------------------------------------------------------------------
// Row types — minimal stubs. The generator will expand these to full Database
// type with Tables, Views, Functions, Enums namespaces.
// ---------------------------------------------------------------------------

export interface TripRow {
  id: string;
  reference_code: string;
  patient_id: string | null;
  requested_by_user_id: string | null;
  is_third_party_request: boolean;
  third_party_name: string | null;
  third_party_phone: string | null;
  third_party_relationship: string | null;
  driver_id: string | null;
  ambulance_id: string | null;
  dispatcher_id: string | null;
  hospital_id: string | null;
  status: TripStatus;
  priority: TripPriority;
  pickup_location: GeoPoint;
  pickup_address: string | null;
  pickup_landmark: string | null;
  destination_location: GeoPoint | null;
  destination_address: string | null;
  patient_name_snapshot: string | null;
  patient_phone_snapshot: string | null;
  pricing_zone_id: string | null;
  estimated_pickup_distance_meters: number | null;
  estimated_pickup_eta_seconds: number | null;
  actual_pickup_distance_meters: number | null;
  actual_pickup_duration_seconds: number | null;
  trip_distance_meters: number | null;
  trip_duration_seconds: number | null;
  base_fare_pesewas: number | null;
  distance_fare_pesewas: number | null;
  time_fare_pesewas: number | null;
  services_fare_pesewas: number | null;
  surcharge_pesewas: number | null;
  discount_pesewas: number;
  total_fare_pesewas: number | null;
  cancellation_reason: string | null;
  cancellation_actor: ActorType | null;
  patient_rating: number | null;
  patient_review: string | null;
  requested_at: string;
  dispatching_started_at: string | null;
  accepted_at: string | null;
  driver_arrived_at_pickup_at: string | null;
  patient_picked_up_at: string | null;
  arrived_at_hospital_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientRow {
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  blood_type:
    | 'A+'
    | 'A-'
    | 'B+'
    | 'B-'
    | 'AB+'
    | 'AB-'
    | 'O+'
    | 'O-'
    | 'unknown'
    | null;
  allergies: string | null;
  chronic_conditions: string | null;
  current_medications: string | null;
  emergency_contacts: Json;
  ghana_card_number: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DriverRow {
  user_id: string;
  full_name: string;
  license_number: string;
  license_expiry: string;
  paramedic_cert: string | null;
  paramedic_cert_expiry: string | null;
  ghana_card_number: string;
  date_of_birth: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: DriverStatus;
  last_location: GeoPoint | null;
  last_location_at: string | null;
  current_ambulance_id: string | null;
  total_trips: number;
  cancellation_count: number;
  average_rating: number | null;
  payout_method: PaymentMethod | null;
  payout_momo_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface HospitalRow {
  id: string;
  name: string;
  short_name: string | null;
  hospital_type: 'public' | 'private' | 'teaching' | 'clinic' | 'specialist';
  address: string;
  city: string;
  region: string;
  location: GeoPoint;
  main_phone: string;
  emergency_phone: string | null;
  has_emergency_room: boolean;
  has_trauma_center: boolean;
  has_stroke_unit: boolean;
  has_cardiac_unit: boolean;
  has_pediatric_er: boolean;
  has_maternity: boolean;
  is_partner: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  trip_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_pesewas: number;
  provider: string;
  provider_transaction_id: string | null;
  provider_response: Json | null;
  momo_number: string | null;
  momo_network: 'mtn' | 'vodafone' | 'airteltigo' | null;
  cash_collected_by_user_id: string | null;
  initiated_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  refunded_amount_pesewas: number;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Placeholder shape compatible with Supabase client's `Database` generic.
// The __InternalSupabase marker is required by @supabase/ssr ≥0.4.
export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12.2.3';
  };
  public: {
    Tables: {
      trips: { Row: TripRow; Insert: Partial<TripRow>; Update: Partial<TripRow> };
      patients: {
        Row: PatientRow;
        Insert: Partial<PatientRow>;
        Update: Partial<PatientRow>;
      };
      drivers: {
        Row: DriverRow;
        Insert: Partial<DriverRow>;
        Update: Partial<DriverRow>;
      };
      hospitals: {
        Row: HospitalRow;
        Insert: Partial<HospitalRow>;
        Update: Partial<HospitalRow>;
      };
      payments: {
        Row: PaymentRow;
        Insert: Partial<PaymentRow>;
        Update: Partial<PaymentRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      trip_status: TripStatus;
      trip_priority: TripPriority;
      driver_status: DriverStatus;
      ambulance_status: AmbulanceStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      actor_type: ActorType;
    };
  };
}
