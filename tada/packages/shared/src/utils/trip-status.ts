/**
 * Trip status state machine. Mirrors the SQL is_valid_trip_transition function
 * in migration 006. Used by the apps to:
 *   - Validate transitions before sending updates (defense in depth)
 *   - Display human-readable status labels
 *   - Determine which UI to show for a given status
 *   - Classify trips (active vs. terminal, success vs. failure)
 *
 * If you change the SQL function, change THIS file too. They must agree.
 */

import type { TripStatus } from '../database.types.js';

// ---------------------------------------------------------------------------
// Transition map. Keys = current status. Values = allowed next statuses.
// ---------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<TripStatus, readonly TripStatus[]> = {
  requested: [
    'dispatching',
    'cancelled_by_patient',
    'cancelled_by_dispatcher',
    'no_driver_found',
  ],
  dispatching: [
    'accepted',
    'cancelled_by_patient',
    'cancelled_by_dispatcher',
    'no_driver_found',
  ],
  accepted: [
    'en_route_to_pickup',
    'cancelled_by_patient',
    'cancelled_by_dispatcher',
    'driver_aborted',
  ],
  en_route_to_pickup: [
    'arrived_at_pickup',
    'cancelled_by_patient',
    'cancelled_by_dispatcher',
    'driver_aborted',
  ],
  arrived_at_pickup: [
    'patient_onboard',
    'cancelled_by_patient',
    'cancelled_by_dispatcher',
    'driver_aborted',
  ],
  patient_onboard: [
    'en_route_to_hospital',
    'cancelled_by_dispatcher',
    'driver_aborted',
  ],
  en_route_to_hospital: [
    'arrived_at_hospital',
    'cancelled_by_dispatcher',
    'driver_aborted',
  ],
  arrived_at_hospital: ['completed'],

  // Terminal states — no transitions out
  completed: [],
  cancelled_by_patient: [],
  cancelled_by_dispatcher: [],
  no_driver_found: [],
  driver_aborted: [],
};

/**
 * Returns true if a trip can transition from one status to another.
 * Mirrors the SQL is_valid_trip_transition function exactly.
 */
export function isValidTripTransition(
  from: TripStatus,
  to: TripStatus
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Returns the list of statuses a trip can transition to from its current state.
 * Useful for rendering action buttons (e.g. "Confirm pickup" only shows when
 * patient_onboard is in the allowed transitions).
 */
export function getAllowedTransitions(from: TripStatus): readonly TripStatus[] {
  return ALLOWED_TRANSITIONS[from];
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

const TERMINAL_STATUSES = new Set<TripStatus>([
  'completed',
  'cancelled_by_patient',
  'cancelled_by_dispatcher',
  'no_driver_found',
  'driver_aborted',
]);

const FAILURE_STATUSES = new Set<TripStatus>([
  'cancelled_by_patient',
  'cancelled_by_dispatcher',
  'no_driver_found',
  'driver_aborted',
]);

const ACTIVE_STATUSES = new Set<TripStatus>([
  'requested',
  'dispatching',
  'accepted',
  'en_route_to_pickup',
  'arrived_at_pickup',
  'patient_onboard',
  'en_route_to_hospital',
  'arrived_at_hospital',
]);

const POST_PICKUP_STATUSES = new Set<TripStatus>([
  'patient_onboard',
  'en_route_to_hospital',
  'arrived_at_hospital',
  'completed',
]);

export function isTerminalStatus(status: TripStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function isFailureStatus(status: TripStatus): boolean {
  return FAILURE_STATUSES.has(status);
}

export function isActiveStatus(status: TripStatus): boolean {
  return ACTIVE_STATUSES.has(status);
}

export function isPostPickup(status: TripStatus): boolean {
  return POST_PICKUP_STATUSES.has(status);
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Short, neutral status label suitable for badges and lists.
 */
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  requested: 'Requested',
  dispatching: 'Finding driver',
  accepted: 'Driver assigned',
  en_route_to_pickup: 'Driver en route',
  arrived_at_pickup: 'Driver arrived',
  patient_onboard: 'Patient on board',
  en_route_to_hospital: 'Heading to hospital',
  arrived_at_hospital: 'Arrived at hospital',
  completed: 'Completed',
  cancelled_by_patient: 'Cancelled by patient',
  cancelled_by_dispatcher: 'Cancelled by dispatcher',
  no_driver_found: 'No driver found',
  driver_aborted: 'Driver aborted',
};

/**
 * Patient-facing status messages. Reassuring, action-oriented.
 * Used in the patient app waiting screen and SMS notifications.
 */
export const TRIP_STATUS_PATIENT_MESSAGES: Record<TripStatus, string> = {
  requested: 'Your request has been received.',
  dispatching: 'Finding an available ambulance near you...',
  accepted: 'A driver has accepted your request and is on the way.',
  en_route_to_pickup: 'Your ambulance is on the way to you.',
  arrived_at_pickup: 'Your ambulance has arrived. The driver is looking for you.',
  patient_onboard: 'You are now on board. Heading to the hospital.',
  en_route_to_hospital: 'On the way to the hospital.',
  arrived_at_hospital: 'You have arrived at the hospital.',
  completed: 'Trip completed. Get well soon.',
  cancelled_by_patient: 'You cancelled this trip.',
  cancelled_by_dispatcher: 'This trip was cancelled by the dispatcher.',
  no_driver_found: 'We could not find an available ambulance. Please try again or call 112.',
  driver_aborted: 'Your driver had to abort the trip. We are sending another ambulance.',
};

/**
 * Driver-facing status labels. More operational.
 */
export const TRIP_STATUS_DRIVER_LABELS: Record<TripStatus, string> = {
  requested: 'New request',
  dispatching: 'Awaiting acceptance',
  accepted: 'Accepted — start driving',
  en_route_to_pickup: 'En route to pickup',
  arrived_at_pickup: 'At pickup — collect patient',
  patient_onboard: 'Patient on board',
  en_route_to_hospital: 'En route to hospital',
  arrived_at_hospital: 'At hospital — handover',
  completed: 'Completed',
  cancelled_by_patient: 'Patient cancelled',
  cancelled_by_dispatcher: 'Dispatcher cancelled',
  no_driver_found: 'No driver was found',
  driver_aborted: 'You aborted this trip',
};

/**
 * Semantic color category for status display. Maps to UI tokens (Tailwind
 * classes, native theme colors, etc.) at the app layer.
 */
export type StatusTone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger';

export const TRIP_STATUS_TONES: Record<TripStatus, StatusTone> = {
  requested: 'info',
  dispatching: 'progress',
  accepted: 'progress',
  en_route_to_pickup: 'progress',
  arrived_at_pickup: 'progress',
  patient_onboard: 'progress',
  en_route_to_hospital: 'progress',
  arrived_at_hospital: 'success',
  completed: 'success',
  cancelled_by_patient: 'neutral',
  cancelled_by_dispatcher: 'warning',
  no_driver_found: 'danger',
  driver_aborted: 'danger',
};

/**
 * Returns the ordered lifecycle of statuses a trip passes through on the
 * happy path. Used to render progress timelines (e.g. the patient waiting
 * screen "What's happening" section).
 */
export const HAPPY_PATH_LIFECYCLE: readonly TripStatus[] = [
  'requested',
  'dispatching',
  'accepted',
  'en_route_to_pickup',
  'arrived_at_pickup',
  'patient_onboard',
  'en_route_to_hospital',
  'arrived_at_hospital',
  'completed',
];
