/**
 * Hardcoded placeholder data for the driver app pilot build.
 *
 * ====================================================================
 * REPLACE BEFORE PRODUCTION — see BEFORE_LAUNCH.md
 * ====================================================================
 * Every value here is a stand-in for a real Supabase query:
 *   - DRIVER         -> the logged-in driver's `drivers` profile row
 *   - INCOMING_REQUEST -> a realtime `trips` row pushed from dispatch
 *   - ACTIVE_TRIP    -> the assigned trip + patient medical snapshot
 *   - EARNINGS / STATS -> aggregated from `trips` + `payments`
 * Monetary amounts are in PESEWAS (integer); pass straight to formatCurrency.
 * ====================================================================
 */
import { PILOT_PLACEHOLDER_NUMBERS } from './telephony';

export const DRIVER = {
  id: 'drv_pilot_001',
  fullName: 'Yaw Boateng',
  employeeId: 'TADA-PM-0142',
  role: 'Paramedic',
  rating: 4.9,
  totalTrips: 1284,
  yearsExperience: 6,
  phone: '+233241234567',
  email: 'yaw.boateng@tada.test',
  baseStation: 'Ridge Station, Accra',
  ambulance: {
    callSign: 'AMB-07',
    plate: 'GR-4821-23',
    type: 'Advanced Life Support',
  },
  certifications: [
    { name: 'Emergency Medical Technician (EMT-A)', issuer: 'Ghana Ambulance Service', expires: '2027-03-01', valid: true },
    { name: 'Advanced Cardiac Life Support (ACLS)', issuer: 'Ghana Red Cross', expires: '2026-11-15', valid: true },
    { name: 'Defensive Driving — Emergency Vehicles', issuer: 'DVLA', expires: '2026-08-30', valid: true },
    { name: 'Pediatric Advanced Life Support (PALS)', issuer: 'Korle Bu Training', expires: '2026-06-01', valid: false },
  ],
} as const;

// ---------------------------------------------------------------------------
// Incoming emergency request (the urgent modal on the dashboard).
// In production this arrives over a realtime channel from dispatch.
// ---------------------------------------------------------------------------
export type RequestPriority = 'critical' | 'urgent' | 'standard';

export interface PatientSnapshot {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  phone: string;
  emergencyContact: { name: string; relation: string; phone: string };
}

export interface EmergencyRequest {
  id: string;
  priority: RequestPriority;
  complaint: string;
  triageNote: string;
  pickupLabel: string;
  pickupArea: string;
  distanceMeters: number;
  etaMinutes: number;
  patient: PatientSnapshot;
}

export const INCOMING_REQUEST: EmergencyRequest = {
  id: 'trip_pilot_5571',
  priority: 'critical',
  complaint: 'Chest pain & shortness of breath',
  triageNote: 'Caller reports 58yo male, conscious, clutching chest, sweating. Possible cardiac event.',
  pickupLabel: 'Independence Avenue, Ridge',
  pickupArea: 'Accra Central',
  distanceMeters: 2300,
  etaMinutes: 6,
  patient: {
    name: 'Kofi Mensah',
    age: 58,
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Aspirin'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    phone: PILOT_PLACEHOLDER_NUMBERS.patient,
    emergencyContact: { name: 'Ama Mensah', relation: 'Wife', phone: '+233209876543' },
  },
};

// ---------------------------------------------------------------------------
// Destination hospital, used once the patient is on board.
// ---------------------------------------------------------------------------
export const DESTINATION_HOSPITAL = {
  name: 'Korle Bu Teaching Hospital',
  department: 'Emergency / Cardiac',
  distanceMeters: 7400,
  etaMinutes: 12,
  phone: PILOT_PLACEHOLDER_NUMBERS.hospital,
} as const;

export const DISPATCH = {
  name: 'TADA Dispatch',
  phone: PILOT_PLACEHOLDER_NUMBERS.dispatch,
} as const;

// ---------------------------------------------------------------------------
// Performance / earnings (Earnings screen). Amounts in PESEWAS.
// ---------------------------------------------------------------------------
export type EarningsPeriod = 'day' | 'week' | 'month';

export interface PeriodStats {
  label: string;
  trips: number;
  earningsPesewas: number;
  hoursOnline: number;
}

export const STATS: Record<EarningsPeriod, PeriodStats> = {
  day: { label: 'Today', trips: 4, earningsPesewas: 38000, hoursOnline: 7.5 },
  week: { label: 'This week', trips: 23, earningsPesewas: 214500, hoursOnline: 41 },
  month: { label: 'This month', trips: 96, earningsPesewas: 902000, hoursOnline: 168 },
};

/** Per-day earnings for the current week (pesewas) — for the bar chart. */
export const WEEKLY_BREAKDOWN: { day: string; earningsPesewas: number }[] = [
  { day: 'Mon', earningsPesewas: 41000 },
  { day: 'Tue', earningsPesewas: 28500 },
  { day: 'Wed', earningsPesewas: 52000 },
  { day: 'Thu', earningsPesewas: 33000 },
  { day: 'Fri', earningsPesewas: 60000 },
  { day: 'Sat', earningsPesewas: 0 },
  { day: 'Sun', earningsPesewas: 0 },
];

export const PAYMENT_SCHEDULE = {
  nextPayoutDate: 'Fri, 29 May 2026',
  pendingPesewas: 214500,
  method: 'MTN MoMo •••• 4567',
} as const;

/** Recent rating feedback (Profile screen). */
export const RECENT_RATINGS: { stars: number; note: string; date: string }[] = [
  { stars: 5, note: 'Calm and professional under pressure.', date: '24 May' },
  { stars: 5, note: 'Arrived faster than the ETA. Thank you.', date: '23 May' },
  { stars: 4, note: 'Good care, slightly hard to find us.', date: '21 May' },
];
