import Superwall from 'expo-superwall/compat';

export async function showPaywall(placement: string, params?: Record<string, any>) {
  try {
    await Superwall.register({ placement, params });
  } catch (e) {
    console.log('Superwall: failed to present paywall', e);
  }
}

export async function getSubscriptionStatus() {
  try {
    return await Superwall.shared.getSubscriptionStatus();
  } catch (e) {
    console.log('Superwall: failed to get subscription status', e);
    throw e;
  }
}
