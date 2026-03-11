import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
const shouldUseSuperwall = !isExpoGo && Platform.OS !== 'web';

/**
 * Standalone paywall helper for use outside of React components.
 * For components, prefer useSubscription().showPaywall() instead.
 */
export async function showPaywall(placement: string, params?: Record<string, any>) {
  if (!shouldUseSuperwall) return;

  try {
    const Superwall = (await import('expo-superwall/compat')).default;
    await Superwall.shared.register({ placement, params });
  } catch (e) {
    console.log('[Superwall] Failed to present paywall:', e);
  }
}

export async function getSubscriptionStatus() {
  if (!shouldUseSuperwall) return { status: 'UNKNOWN' };

  try {
    const Superwall = (await import('expo-superwall/compat')).default;
    return await Superwall.shared.getSubscriptionStatus();
  } catch (e) {
    console.log('[Superwall] Failed to get subscription status:', e);
    throw e;
  }
}
