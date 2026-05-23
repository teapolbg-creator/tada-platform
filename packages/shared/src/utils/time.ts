/**
 * Time and duration formatting utilities.
 * All times handled as ISO strings or numeric seconds/milliseconds.
 */

import { GHANA } from '../constants/ghana';

/**
 * Format a duration in seconds for display.
 *
 * formatDuration(45)     => "45 sec"
 * formatDuration(90)     => "2 min"
 * formatDuration(3600)   => "1 hr"
 * formatDuration(3900)   => "1 hr 5 min"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return '—';
  }

  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total} sec`;

  const minutes = Math.round(total / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format an ETA — a duration into the future — for display.
 * Slightly different language from formatDuration: "now", "1 min", etc.
 *
 * formatETA(0)    => "Arriving now"
 * formatETA(30)   => "<1 min"
 * formatETA(180)  => "3 min"
 * formatETA(900)  => "15 min"
 */
export function formatETA(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return '—';
  }
  if (seconds <= 5) return 'Arriving now';
  if (seconds < 60) return '<1 min';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  return formatDuration(seconds);
}

/**
 * Format an ISO timestamp as a relative-time string.
 *
 * formatRelativeTime("2 seconds ago iso")  => "Just now"
 * formatRelativeTime("3 minutes ago iso")  => "3 min ago"
 * formatRelativeTime("2 hours ago iso")    => "2 hr ago"
 * formatRelativeTime("yesterday iso")      => "Yesterday"
 */
export function formatRelativeTime(
  iso: string | Date | null | undefined,
  nowMs: number = Date.now()
): string {
  if (!iso) return '—';
  const then = iso instanceof Date ? iso.getTime() : new Date(iso).getTime();
  if (!Number.isFinite(then)) return '—';

  const diffSeconds = Math.round((nowMs - then) / 1000);

  if (Math.abs(diffSeconds) < 10) return 'Just now';
  if (diffSeconds < 0) {
    // In the future
    return `in ${formatDuration(-diffSeconds)}`;
  }
  if (diffSeconds < 60) return `${diffSeconds} sec ago`;
  if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)} min ago`;
  if (diffSeconds < 86_400) return `${Math.round(diffSeconds / 3600)} hr ago`;
  if (diffSeconds < 172_800) return 'Yesterday';

  return `${Math.round(diffSeconds / 86_400)} days ago`;
}

/**
 * Format an ISO timestamp as a time of day in the Africa/Accra timezone.
 *
 * formatTimeOfDay("2026-05-22T14:30:00Z") => "2:30 PM"
 */
export function formatTimeOfDay(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(GHANA.defaultLocale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: GHANA.timezone,
  }).format(date);
}

/**
 * Format an ISO timestamp as a date in the Africa/Accra timezone.
 *
 * formatDate("2026-05-22T...") => "22 May 2026"
 */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(GHANA.defaultLocale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: GHANA.timezone,
  }).format(date);
}

/**
 * Returns true if the given timestamp falls in the "night" surcharge window
 * (10pm–6am Africa/Accra). Mirrors the SQL surcharge logic in migration 006.
 */
export function isNightTime(iso: string | Date | null | undefined): boolean {
  if (!iso) return false;
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return false;

  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: GHANA.timezone,
    }).format(date)
  );

  return hour >= 22 || hour < 6;
}
