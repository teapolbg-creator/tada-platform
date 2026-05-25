/**
 * Mock data for the dispatcher dashboard (Option A — no backend).
 *
 * REPLACE IN MODULE 5:
 * Every export in this file becomes a real Supabase query or realtime
 * subscription:
 *   - OPERATOR        → auth session (the logged-in dispatcher)
 *   - REQUESTS        → live subscription on `trips` table (status = 'requested')
 *   - ACTIVE_TRIPS    → live subscription on `trips` table (status in progress)
 *   - AMBULANCES      → query against `ambulances` table joined with `drivers`
 *   - STATS           → derived counts from above
 *
 * Until then, this is the only place demo data lives. Don't sprinkle
 * hardcoded names/numbers across screens — keep them here.
 */

// ---------------------------------------------------------------------------
// The logged-in dispatcher
// ---------------------------------------------------------------------------

export const OPERATOR = {
  name: 'Sarah Nkrumah',
  role: 'Operator',
  station: 'Station A',
};

// ---------------------------------------------------------------------------
// Request queue — patient emergency requests waiting for action
// ---------------------------------------------------------------------------

export type RequestPriority = 'high' | 'medium' | 'low';
export type RequestStatus = 'pending' | 'active' | 'arriving';

export interface EmergencyRequest {
  id: string;
  patientName: string;
  pickupAddress: string;
  minutesAgo: number;
  priority: RequestPriority;
  status: RequestStatus;
  /** When assigned, the ambulance handling this request */
  assignedAmbulance?: {
    code: string;
    distanceKm: number;
  };
}

export const REQUESTS: EmergencyRequest[] = [
  {
    id: 'REQ-2847',
    patientName: 'Kofi Mensah',
    pickupAddress: 'Independence Ave, Ridge',
    minutesAgo: 2,
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'REQ-2846',
    patientName: 'Abena Osei',
    pickupAddress: 'Osu Oxford Street',
    minutesAgo: 5,
    priority: 'medium',
    status: 'active',
    assignedAmbulance: { code: 'AMB-2847', distanceKm: 0.8 },
  },
  {
    id: 'REQ-2845',
    patientName: 'Kwesi Appiah',
    pickupAddress: 'Labone',
    minutesAgo: 8,
    priority: 'low',
    status: 'arriving',
    assignedAmbulance: { code: 'AMB-2845', distanceKm: 2.5 },
  },
];

// ---------------------------------------------------------------------------
// Ambulance fleet
// ---------------------------------------------------------------------------

export type AmbulanceStatus = 'available' | 'busy' | 'offline';

export interface Ambulance {
  code: string;
  driverName: string;
  driverRating: number;
  status: AmbulanceStatus;
  /** Current location text (in production: reverse-geocoded from GPS) */
  currentLocation: string;
  /** Minutes since last GPS ping or status update */
  updatedMinutesAgo: number;
  /** Number of trips completed today */
  tripsToday: number;
  /** Approximate position on the dashboard map placeholder, 0-1 scale */
  mapPosition: { x: number; y: number };
}

export const AMBULANCES: Ambulance[] = [
  {
    code: 'AMB-2847',
    driverName: 'Kwame Asante',
    driverRating: 4.9,
    status: 'busy',
    currentLocation: 'En route to Ridge Hospital',
    updatedMinutesAgo: 1,
    tripsToday: 8,
    mapPosition: { x: 0.45, y: 0.55 },
  },
  {
    code: 'AMB-2850',
    driverName: 'Ama Serwaa',
    driverRating: 4.8,
    status: 'available',
    currentLocation: 'Central Station, Accra',
    updatedMinutesAgo: 3,
    tripsToday: 6,
    mapPosition: { x: 0.22, y: 0.42 },
  },
  {
    code: 'AMB-2845',
    driverName: 'Yaw Mensah',
    driverRating: 5.0,
    status: 'busy',
    currentLocation: 'En route to Labone',
    updatedMinutesAgo: 2,
    tripsToday: 5,
    mapPosition: { x: 0.68, y: 0.58 },
  },
  {
    code: 'AMB-2842',
    driverName: 'Akosua Boateng',
    driverRating: 4.7,
    status: 'available',
    currentLocation: 'Tema Station',
    updatedMinutesAgo: 5,
    tripsToday: 4,
    mapPosition: { x: 0.85, y: 0.3 },
  },
  {
    code: 'AMB-2840',
    driverName: 'Kojo Owusu',
    driverRating: 4.6,
    status: 'available',
    currentLocation: 'Spintex Road Base',
    updatedMinutesAgo: 8,
    tripsToday: 3,
    mapPosition: { x: 0.15, y: 0.75 },
  },
  {
    code: 'AMB-2838',
    driverName: 'Esi Quartey',
    driverRating: 4.5,
    status: 'offline',
    currentLocation: 'Off-duty — last seen Adabraka',
    updatedMinutesAgo: 47,
    tripsToday: 0,
    mapPosition: { x: 0.5, y: 0.85 },
  },
];

// ---------------------------------------------------------------------------
// Derived stats (would be a SQL view or aggregate query in Module 5)
// ---------------------------------------------------------------------------

export const STATS = {
  active: REQUESTS.filter((r) => r.status === 'pending').length,
  inProgress: REQUESTS.filter((r) => r.status !== 'pending').length,
  available: AMBULANCES.filter((a) => a.status === 'available').length,
  totalFleet: AMBULANCES.length,
  onDuty: AMBULANCES.filter((a) => a.status === 'busy').length,
  offline: AMBULANCES.filter((a) => a.status === 'offline').length,
};
