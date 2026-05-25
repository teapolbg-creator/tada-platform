import { Linking, Alert, Platform } from 'react-native';

/**
 * Pilot-mode telephony.
 *
 * Today: launches the native phone dialer with the number pre-filled. iOS
 * always requires the user to tap Call. Android usually does too, unless
 * we add the CALL_PHONE permission (deliberately avoided for the pilot —
 * see BEFORE_LAUNCH.md). Web opens the device's tel: handler if one exists.
 *
 * ====================================================================
 * REPLACE BEFORE PRODUCTION
 * ====================================================================
 * In production, this function must be replaced with a call to our backend
 * that proxies the call through Hubtel Voice (number masking). Both
 * patient and paramedic should see a TADA number, not each other's real
 * numbers, to prevent harassment and protect privacy.
 *
 * The replacement signature should be:
 *   await triggerProxyCall({ tripId, fromUserId, toUserId, reason })
 * and the backend Edge Function should:
 *   1. Look up both numbers from auth.users
 *   2. Request Hubtel Voice to bridge them via a TADA proxy number
 *   3. Record call metadata in a calls table for billing/audit
 *
 * See: docs/telephony.md (TODO when Hubtel Voice onboarding starts)
 * ====================================================================
 */
export async function launchDialer(
  phoneNumber: string,
  options: { onError?: () => void } = {}
): Promise<void> {
  // Strip any formatting characters before passing to tel: URI
  const sanitized = phoneNumber.replace(/[^\d+]/g, '');
  const url = `tel:${sanitized}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      // Common on desktop browsers — no tel: handler installed
      const msg = 'This device cannot place phone calls.';
      if (Platform.OS === 'web') {
        const w = globalThis as { alert?: (m: string) => void };
        w.alert?.(msg);
      } else {
        Alert.alert('Cannot call', msg);
      }
      options.onError?.();
      return;
    }
    await Linking.openURL(url);
  } catch (err) {
    console.warn('launchDialer failed:', err);
    options.onError?.();
  }
}

/**
 * Phone numbers used in pilot mode. Replaced when paramedic and first-aid
 * partner numbers are wired in.
 */
export const PILOT_PLACEHOLDER_NUMBERS = {
  /** Placeholder for the assigned paramedic. Replaced with the real driver's
   *  registered phone number once dispatch is wired. */
  paramedic: '+233240000000',
  /** Placeholder for the first-aid hotline. Replaced when a partner is signed. */
  firstAidHotline: '+233300000000',
};
