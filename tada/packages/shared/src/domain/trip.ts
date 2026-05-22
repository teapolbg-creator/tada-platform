/**
 * Trip domain model. Wraps the raw database row with computed fields and
 * convenience accessors used across the four apps.
 */

import type {
  TripRow,
  TripStatus,
  TripPriority,
  GeoPoint,
} from '../database.types.js';
import {
  isActiveStatus,
  isTerminalStatus,
  isFailureStatus,
  isPostPickup,
  TRIP_STATUS_LABELS,
  TRIP_STATUS_TONES,
  type StatusTone,
} from '../utils/trip-status.js';
import { formatCurrency, sumPesewas } from '../utils/currency.js';
import { formatDuration, formatRelativeTime } from '../utils/time.js';

export interface FareBreakdown {
  base: number;
  distance: number;
  time: number;
  services: number;
  surcharge: number;
  discount: number;
  total: number;
  isFinal: boolean;
}

export interface TripDomain {
  id: string;
  referenceCode: string;
  status: TripStatus;
  statusLabel: string;
  statusTone: StatusTone;
  priority: TripPriority;
  pickupLocation: GeoPoint;
  pickupAddress: string | null;
  destinationAddress: string | null;
  hospitalId: string | null;
  driverId: string | null;
  patientId: string | null;
  isThirdPartyRequest: boolean;

  /** Lifecycle flags — derived from status */
  isActive: boolean;
  isTerminal: boolean;
  isFailure: boolean;
  isPostPickup: boolean;
  canBeCancelledByPatient: boolean;
  canBeRated: boolean;

  /** Fare. Only `isFinal` once status is completed. */
  fare: FareBreakdown;
  fareLabel: string;

  /** Timestamps */
  requestedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;

  /** Display helpers */
  relativeRequestedTime: string;
  tripDurationLabel: string | null;
}

/**
 * Build a domain Trip from a raw row. Pure function — no side effects.
 */
export function toTripDomain(row: TripRow): TripDomain {
  const fare = buildFareBreakdown(row);

  return {
    id: row.id,
    referenceCode: row.reference_code,
    status: row.status,
    statusLabel: TRIP_STATUS_LABELS[row.status],
    statusTone: TRIP_STATUS_TONES[row.status],
    priority: row.priority,
    pickupLocation: row.pickup_location,
    pickupAddress: row.pickup_address,
    destinationAddress: row.destination_address,
    hospitalId: row.hospital_id,
    driverId: row.driver_id,
    patientId: row.patient_id,
    isThirdPartyRequest: row.is_third_party_request,

    isActive: isActiveStatus(row.status),
    isTerminal: isTerminalStatus(row.status),
    isFailure: isFailureStatus(row.status),
    isPostPickup: isPostPickup(row.status),
    canBeCancelledByPatient: canPatientCancel(row.status),
    canBeRated: row.status === 'completed' && row.patient_rating === null,

    fare,
    fareLabel: formatCurrency(fare.total),

    requestedAt: row.requested_at,
    acceptedAt: row.accepted_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,

    relativeRequestedTime: formatRelativeTime(row.requested_at),
    tripDurationLabel:
      row.trip_duration_seconds !== null
        ? formatDuration(row.trip_duration_seconds)
        : null,
  };
}

function buildFareBreakdown(row: TripRow): FareBreakdown {
  const base = row.base_fare_pesewas ?? 0;
  const distance = row.distance_fare_pesewas ?? 0;
  const time = row.time_fare_pesewas ?? 0;
  const services = row.services_fare_pesewas ?? 0;
  const surcharge = row.surcharge_pesewas ?? 0;
  const discount = row.discount_pesewas ?? 0;
  const total =
    row.total_fare_pesewas ??
    Math.max(0, sumPesewas(base, distance, time, services, surcharge) - discount);

  return {
    base,
    distance,
    time,
    services,
    surcharge,
    discount,
    total,
    isFinal: row.total_fare_pesewas !== null && row.status === 'completed',
  };
}

/**
 * Per business rules, a patient can cancel:
 *   - Anytime before the driver is on the way (statuses up to 'accepted')
 *   - During pickup approach (en_route_to_pickup, arrived_at_pickup) but
 *     a cancellation fee applies after the free-cancellation window
 *
 * Once patient_onboard, only the dispatcher can cancel.
 */
function canPatientCancel(status: TripStatus): boolean {
  return (
    status === 'requested' ||
    status === 'dispatching' ||
    status === 'accepted' ||
    status === 'en_route_to_pickup' ||
    status === 'arrived_at_pickup'
  );
}
