/**
 * Mock data for the hospital admin portal (Option A — no backend).
 *
 * REPLACE IN MODULE 5:
 *   - HOSPITAL          → derived from the logged-in administrator's hospital_id
 *   - ADMINISTRATOR     → auth session
 *   - INCOMING_PATIENTS → live subscription on `trips` where destination_hospital_id matches
 *                         and status in (en_route_to_hospital). Joined with patients +
 *                         drivers + ambulances + triage_records for the medical info.
 *   - RECENT_ADMISSIONS → query against `trips` where status = 'completed' AND
 *                         destination_hospital_id matches, ordered by completed_at desc.
 *   - BED_AVAILABILITY  → query against hospitals.bed_capacity_available / occupied / reserved
 *   - STAFF_ON_DUTY     → query against hospital_staff joined with on-duty roster
 *   - MEDICAL_EQUIPMENT + BLOOD_BANK → these tables don't exist yet in the schema and
 *                                       would need migrations. Marked in BEFORE_LAUNCH.md.
 *
 * Patient names match the dispatcher's request queue (Kofi Mensah, Abena Osei,
 * Kwesi Appiah) so the two apps demo as the same coherent scenario.
 */

// ---------------------------------------------------------------------------
// Hospital and administrator
// ---------------------------------------------------------------------------

export const HOSPITAL = {
  name: 'Ridge Hospital',
  department: 'Emergency Dept.',
};

export const ADMINISTRATOR = {
  name: 'Dr. Naa Lamptey',
  role: 'ER Administrator',
};

// ---------------------------------------------------------------------------
// Incoming patients (en route to this hospital)
// ---------------------------------------------------------------------------

export type PatientPriority = 'high' | 'medium' | 'low';

export interface IncomingPatient {
  patientId: string;
  name: string;
  priority: PatientPriority;
  bloodType: string;
  condition: string;
  etaMinutes: number;
  distanceKm: number;
  allergies: string;
  preExisting: string;
  ambulanceCode: string;
  paramedicName: string;
  pickupAddress: string;
}

export const INCOMING_PATIENTS: IncomingPatient[] = [
  {
    patientId: 'P-2847',
    name: 'Kofi Mensah',
    priority: 'high',
    bloodType: 'O+',
    condition: 'Chest pain',
    etaMinutes: 3,
    distanceKm: 1.2,
    allergies: 'Penicillin',
    preExisting: 'Asthma',
    ambulanceCode: 'AMB-2847',
    paramedicName: 'Kwame Asante',
    pickupAddress: 'Independence Ave, Ridge',
  },
  {
    patientId: 'P-2846',
    name: 'Abena Osei',
    priority: 'medium',
    bloodType: 'A+',
    condition: 'Severe headache, dizziness',
    etaMinutes: 8,
    distanceKm: 3.5,
    allergies: 'None',
    preExisting: 'Hypertension',
    ambulanceCode: 'AMB-2850',
    paramedicName: 'Ama Serwaa',
    pickupAddress: 'Osu Oxford Street',
  },
  {
    patientId: 'P-2845',
    name: 'Kwesi Appiah',
    priority: 'low',
    bloodType: 'B+',
    condition: 'Leg injury from fall',
    etaMinutes: 15,
    distanceKm: 6.8,
    allergies: 'Aspirin',
    preExisting: 'Diabetes',
    ambulanceCode: 'AMB-2845',
    paramedicName: 'Yaw Mensah',
    pickupAddress: 'Labone',
  },
];

// ---------------------------------------------------------------------------
// Recent admissions (already arrived + handed off)
// ---------------------------------------------------------------------------

export interface RecentAdmission {
  patientId: string;
  name: string;
  admittedMinutesAgo: number;
  status: 'completed';
}

export const RECENT_ADMISSIONS: RecentAdmission[] = [
  {
    patientId: 'P-2844',
    name: 'Ama Frimpong',
    admittedMinutesAgo: 30,
    status: 'completed',
  },
  {
    patientId: 'P-2843',
    name: 'Kofi Darko',
    admittedMinutesAgo: 60,
    status: 'completed',
  },
];

// ---------------------------------------------------------------------------
// Resource management — beds, staff, equipment, blood bank
// ---------------------------------------------------------------------------

export const BED_AVAILABILITY = {
  available: 8,
  occupied: 15,
  reserved: 2,
  total: 25,
  // Capacity calculated below to avoid the magic number drifting
  get capacityPercent() {
    return Math.round((this.occupied / this.total) * 100);
  },
};

export const STAFF_ON_DUTY = {
  doctors: 5,
  nurses: 12,
  paramedics: 8,
  supportStaff: 6,
};

export type StockLevel = 'good' | 'available' | 'low' | 'critical';

export interface EquipmentItem {
  name: string;
  inUse: number;
  total: number;
  stockLevel: StockLevel;
}

export const MEDICAL_EQUIPMENT: EquipmentItem[] = [
  { name: 'Ventilators', inUse: 4, total: 6, stockLevel: 'available' },
  { name: 'Defibrillators', inUse: 3, total: 4, stockLevel: 'available' },
  { name: 'ECG Machines', inUse: 5, total: 8, stockLevel: 'available' },
  { name: 'Oxygen Tanks', inUse: 12, total: 20, stockLevel: 'low' },
  { name: 'IV Pumps', inUse: 8, total: 12, stockLevel: 'available' },
  { name: 'Stretchers', inUse: 6, total: 10, stockLevel: 'available' },
];

export interface BloodSupply {
  type: string;
  units: number;
  stockLevel: StockLevel;
  /** Percentage of healthy stock for the visual bar (0-100) */
  stockPercent: number;
}

export const BLOOD_BANK: BloodSupply[] = [
  { type: 'Blood Type O+', units: 45, stockLevel: 'good', stockPercent: 90 },
  { type: 'Blood Type A+', units: 38, stockLevel: 'good', stockPercent: 76 },
  { type: 'Blood Type B+', units: 22, stockLevel: 'low', stockPercent: 35 },
  { type: 'Blood Type AB+', units: 15, stockLevel: 'low', stockPercent: 28 },
];

export interface SupplyItem {
  name: string;
  stockedPercent: number;
  stockLevel: StockLevel;
}

export const SUPPLIES: SupplyItem[] = [
  { name: 'Emergency Medications', stockedPercent: 85, stockLevel: 'good' },
  { name: 'Surgical Supplies', stockedPercent: 72, stockLevel: 'good' },
];

// ---------------------------------------------------------------------------
// Sidebar stat counters
// ---------------------------------------------------------------------------

export const SIDEBAR_STATS = {
  incoming: INCOMING_PATIENTS.length,
  beds: BED_AVAILABILITY.available,
  staff:
    STAFF_ON_DUTY.doctors +
    STAFF_ON_DUTY.nurses +
    STAFF_ON_DUTY.paramedics +
    STAFF_ON_DUTY.supportStaff,
};

// ---------------------------------------------------------------------------
// ER capacity (used in dashboard header)
// ---------------------------------------------------------------------------

export const ER_CAPACITY = {
  status: 'ER Ready' as const,
  capacityPercent: 85,
};
