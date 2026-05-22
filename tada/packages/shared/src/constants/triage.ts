/**
 * Triage protocol — maps reported emergency types and clinical signs to a
 * recommended trip priority. The dispatcher (or the patient via the triage
 * form) provides inputs; this module resolves them to a priority.
 *
 * Based loosely on the standard EMS Acuity Scale (ESI) and adapted for the
 * Ghana pilot. Critical = life-threatening, immediate dispatch.
 *
 * NOT a replacement for clinical judgement. The dispatcher can always override.
 */

import type { TripPriority } from '../database.types';

export type EmergencyType =
  | 'cardiac'
  | 'stroke'
  | 'trauma'
  | 'breathing'
  | 'bleeding'
  | 'seizure'
  | 'allergic_reaction'
  | 'burn'
  | 'pregnancy_labor'
  | 'poisoning'
  | 'psychiatric'
  | 'other';

export const EMERGENCY_TYPE_LABELS: Record<EmergencyType, string> = {
  cardiac: 'Cardiac (chest pain, heart attack)',
  stroke: 'Stroke (sudden weakness, slurred speech)',
  trauma: 'Trauma (major injury, accident)',
  breathing: 'Breathing difficulty',
  bleeding: 'Severe bleeding',
  seizure: 'Seizure / convulsion',
  allergic_reaction: 'Severe allergic reaction',
  burn: 'Burn',
  pregnancy_labor: 'Pregnancy / labour',
  poisoning: 'Poisoning / overdose',
  psychiatric: 'Psychiatric emergency',
  other: 'Other emergency',
} as const;

/**
 * Base priority by emergency type. Modifiable by clinical signs below.
 */
const BASE_PRIORITY: Record<EmergencyType, TripPriority> = {
  cardiac: 'critical',
  stroke: 'critical',
  trauma: 'urgent',
  breathing: 'urgent',
  bleeding: 'urgent',
  seizure: 'urgent',
  allergic_reaction: 'urgent',
  burn: 'urgent',
  pregnancy_labor: 'urgent',
  poisoning: 'urgent',
  psychiatric: 'standard',
  other: 'standard',
};

export interface TriageInputs {
  emergencyType?: EmergencyType;
  isConscious?: boolean;
  isBreathing?: boolean;
  bleedingSeverity?: 'minor' | 'moderate' | 'severe' | 'massive';
  painLevel?: number; // 0–10
}

/**
 * Resolve a recommended priority from triage inputs.
 *
 * Rules (in order — first match wins):
 *   1. Not conscious OR not breathing → critical
 *   2. Massive bleeding → critical
 *   3. Severe bleeding → urgent (if base is standard, bump to urgent)
 *   4. Otherwise: base priority for the emergency type
 *
 * @returns the recommended priority, with a brief explanation
 */
export function resolveTriagePriority(inputs: TriageInputs): {
  priority: TripPriority;
  reason: string;
} {
  if (inputs.isConscious === false) {
    return {
      priority: 'critical',
      reason: 'Patient is unconscious — immediate response',
    };
  }
  if (inputs.isBreathing === false) {
    return {
      priority: 'critical',
      reason: 'Patient not breathing — immediate response',
    };
  }
  if (inputs.bleedingSeverity === 'massive') {
    return {
      priority: 'critical',
      reason: 'Massive bleeding — immediate response',
    };
  }

  const base: TripPriority = inputs.emergencyType
    ? BASE_PRIORITY[inputs.emergencyType]
    : 'standard';

  if (inputs.bleedingSeverity === 'severe' && base === 'standard') {
    return {
      priority: 'urgent',
      reason: 'Severe bleeding — urgent response',
    };
  }

  if (typeof inputs.painLevel === 'number' && inputs.painLevel >= 8 && base === 'standard') {
    return {
      priority: 'urgent',
      reason: 'Severe pain — urgent response',
    };
  }

  return {
    priority: base,
    reason: inputs.emergencyType
      ? `Based on emergency type: ${EMERGENCY_TYPE_LABELS[inputs.emergencyType]}`
      : 'Default priority — no emergency type specified',
  };
}

export const PRIORITY_LABELS: Record<TripPriority, string> = {
  critical: 'Critical',
  urgent: 'Urgent',
  standard: 'Standard',
  transfer: 'Inter-facility transfer',
};

/**
 * Maximum time (in seconds) we expect a driver to take responding to a request
 * of this priority. Used for SLA monitoring on the dispatcher dashboard.
 */
export const PRIORITY_RESPONSE_SLA_SECONDS: Record<TripPriority, number> = {
  critical: 30,
  urgent: 60,
  standard: 120,
  transfer: 300,
};
