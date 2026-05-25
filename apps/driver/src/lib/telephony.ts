import { Linking, Alert, Platform } from 'react-native';

/**
 * Pilot-mode telephony for the driver app.
 *
 * Today: launches the native phone dialer (tel:) or SMS composer (sms:) with
 * the number pre-filled. iOS always requires the user to tap Call/Send.
 * Android usually does too, unless we add the CALL_PHONE permission
 * (deliberately avoided for the pilot — see BEFORE_LAUNCH.md). Web opens the
 * device's tel:/sms: handler if one exists.
 *
 * ====================================================================
 * REPLACE BEFORE PRODUCTION
 * ====================================================================
 * In production these must be replaced with calls to our backend that proxy
 * the call/message through Hubtel Voice/SMS (number masking). The driver
 * should never see the patient's real number, and vice versa — both sides
 * see a TADA number, to prevent harassment and protect privacy once a trip
 * is over.
 *
 * The replacement signatures should be:
 *   await triggerProxyCall({ tripId, fromUserId, toUserId, reason })
 *   await sendProxySms({ tripId, fromUserId, toUserId, body })
 * and the backend Edge Function should:
 *   1. Look up both numbers from auth.users
 *   2. Bridge them via a TADA proxy number (Hubtel Voice / SMS)
 *   3. Record metadata in a calls/messages table for billing/audit
 *
 * See: docs/telephony.md (TODO when Hubtel Voice onboarding starts) and the
 * matching note in apps/patient/src/lib/telephony.ts.
 * ====================================================================
 */

function warnUnsupported(kind: 'call' | 'message', onError?: () => void): void {
  const msg =
    kind === 'call'
      ? 'This device cannot place phone calls.'
      : 'This device cannot send text messages.';
  if (Platform.OS === 'web') {
    const w = globalThis as { alert?: (m: string) => void };
    w.alert?.(msg);
  } else {
    Alert.alert(kind === 'call' ? 'Cannot call' : 'Cannot message', msg);
  }
  onError?.();
}

/** Strip formatting characters before passing to a tel:/sms: URI. */
function sanitize(phoneNumber: string): string {
  return phoneNumber.replace(/[^\d+]/g, '');
}

export async function launchDialer(
  phoneNumber: string,
  options: { onError?: () => void } = {}
): Promise<void> {
  const url = `tel:${sanitize(phoneNumber)}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      warnUnsupported('call', options.onError);
      return;
    }
    await Linking.openURL(url);
  } catch (err) {
    console.warn('launchDialer failed:', err);
    options.onError?.();
  }
}

export async function launchSms(
  phoneNumber: string,
  options: { body?: string; onError?: () => void } = {}
): Promise<void> {
  const number = sanitize(phoneNumber);
  // iOS uses & as the body separator, Android uses ?body=. Plain sms:number
  // works everywhere; the body is best-effort for the pilot.
  const url = options.body
    ? `sms:${number}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(options.body)}`
    : `sms:${number}`;
  try {
    const supported = await Linking.canOpenURL(`sms:${number}`);
    if (!supported) {
      warnUnsupported('message', options.onError);
      return;
    }
    await Linking.openURL(url);
  } catch (err) {
    console.warn('launchSms failed:', err);
    options.onError?.();
  }
}

/**
 * Phone numbers used in pilot mode. Replaced with real, trip-scoped proxy
 * numbers once dispatch + Hubtel Voice are wired in.
 */
export const PILOT_PLACEHOLDER_NUMBERS = {
  /** The patient being transported. Replaced with the patient's registered
   *  number (proxied) once a trip is assigned. */
  patient: '+233240000000',
  /** The TADA dispatch control room. */
  dispatch: '+233302000000',
  /** The receiving hospital's emergency line. Replaced per-trip with the
   *  assigned destination hospital's number. */
  hospital: '+233302111000',
};
