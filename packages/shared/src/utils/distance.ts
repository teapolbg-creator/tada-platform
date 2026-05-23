/**
 * Distance and location utilities. PostGIS handles the heavy lifting server-side;
 * these are for client-side rendering and quick estimates.
 */

import type { GeoPoint } from '../database.types';

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Construct a GeoPoint (GeoJSON Point) from lat/lng.
 * Note: GeoJSON uses [longitude, latitude] order, NOT [lat, lng].
 */
export function makeGeoPoint(latitude: number, longitude: number): GeoPoint {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new TypeError('makeGeoPoint: latitude and longitude must be numbers');
  }
  if (latitude < -90 || latitude > 90) {
    throw new RangeError(`makeGeoPoint: latitude out of range: ${latitude}`);
  }
  if (longitude < -180 || longitude > 180) {
    throw new RangeError(`makeGeoPoint: longitude out of range: ${longitude}`);
  }
  return { type: 'Point', coordinates: [longitude, latitude] };
}

/**
 * Extract { latitude, longitude } from a GeoPoint. Inverse of makeGeoPoint.
 */
export function extractLatLng(
  point: GeoPoint | null | undefined
): { latitude: number; longitude: number } | null {
  if (!point || point.type !== 'Point') return null;
  const [longitude, latitude] = point.coordinates;
  if (longitude === undefined || latitude === undefined) return null;
  return { latitude, longitude };
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two points in meters (Haversine formula).
 * Accurate enough for ETA calculations and distance display in a city pilot.
 */
export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const aLatLng = extractLatLng(a);
  const bLatLng = extractLatLng(b);
  if (!aLatLng || !bLatLng) {
    throw new TypeError('haversineDistanceMeters: invalid GeoPoint');
  }

  const dLat = degToRad(bLatLng.latitude - aLatLng.latitude);
  const dLng = degToRad(bLatLng.longitude - aLatLng.longitude);
  const lat1 = degToRad(aLatLng.latitude);
  const lat2 = degToRad(bLatLng.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Format a distance in meters for display.
 *
 * formatDistance(50)    => "50 m"
 * formatDistance(950)   => "950 m"
 * formatDistance(1500)  => "1.5 km"
 * formatDistance(15000) => "15 km"
 */
export function formatDistance(meters: number | null | undefined): string {
  if (meters === null || meters === undefined || !Number.isFinite(meters)) {
    return '—';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}
