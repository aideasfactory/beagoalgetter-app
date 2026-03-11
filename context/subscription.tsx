import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from '@/context/auth';
import { supabase } from '@/supabase';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
const shouldUseSuperwall = !isExpoGo && Platform.OS !== 'web';

// Conditionally import useSuperwall — it requires SuperwallProvider as ancestor
let _useSuperwall: (() => any) | null = null;
if (shouldUseSuperwall) {
  try {
    _useSuperwall = require('expo-superwall').useSuperwall;
  } catch {
    // expo-superwall not available
  }
}

interface SubscriptionContextType {
  plan: 'free' | 'pro' | 'lifetime';
  isPaid: boolean;
  isLoading: boolean;
  showPaywall: (placement: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: 'free',
  isPaid: false,
  isLoading: true,
  showPaywall: async () => {},
  refreshSubscription: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

const defaultSuperwall = {
  isConfigured: false,
  subscriptionStatus: { status: 'UNKNOWN' },
  identify: async (_userId: string) => {},
  registerPlacement: async (_placement: string) => {},
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [plan, setPlan] = useState<'free' | 'pro' | 'lifetime'>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Use the Superwall hook when available (inside SuperwallProvider)
  const superwall = _useSuperwall ? _useSuperwall() : defaultSuperwall;
  const { isConfigured, subscriptionStatus, identify, registerPlacement } = superwall;

  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setPlan('free');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan, subscription_expires_at')
        .eq('id', user.id)
        .single();

      if (error) {
        // Gracefully handle missing columns (migration not yet run)
        if (error.message?.includes('column') || error.code === '42703') {
          console.log('[Superwall] DB subscription columns not found — defaulting to free');
          setPlan('free');
          setIsLoading(false);
          return;
        }
        throw error;
      }

      // Lifetime is always authoritative from DB
      if (profile?.plan === 'lifetime') {
        setPlan('lifetime');
        setIsLoading(false);
        return;
      }

      // Check Superwall subscription status (reactive from useSuperwall hook)
      const swStatus = subscriptionStatus?.status || 'UNKNOWN';
      let currentPlan: 'free' | 'pro' | 'lifetime' = 'free';

      if (swStatus === 'ACTIVE') {
        currentPlan = 'pro';

        // Sync DB if out of date
        if (profile?.plan !== 'pro') {
          await supabase
            .from('profiles')
            .update({ plan: 'pro', updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      } else if (profile?.plan === 'pro') {
        // DB says pro but Superwall doesn't confirm — check expiry
        if (profile?.subscription_expires_at) {
          const expiresAt = new Date(profile.subscription_expires_at);
          if (expiresAt < new Date()) {
            await supabase
              .from('profiles')
              .update({
                plan: 'free',
                subscription_expires_at: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);
          } else {
            currentPlan = 'pro';
          }
        }
      }

      setPlan(currentPlan);
    } catch (error) {
      console.error('[Superwall] Error refreshing subscription:', error);
      setPlan('free');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, subscriptionStatus?.status]);

  const showPaywall = useCallback(async (placement: string) => {
    if (!shouldUseSuperwall || !isConfigured) {
      console.log('[Superwall] SDK not configured, cannot show paywall');
      return;
    }

    try {
      await registerPlacement(placement);
      // Refresh after paywall dismisses
      await refreshSubscription();
    } catch (error) {
      console.error('[Superwall] Error showing paywall:', error);
    }
  }, [isConfigured, registerPlacement, refreshSubscription]);

  // Identify user in Superwall when logged in and SDK is configured
  useEffect(() => {
    if (!shouldUseSuperwall || !isConfigured || !user?.id) return;

    identify(user.id).catch((error: unknown) => {
      console.error('[Superwall] Error identifying user:', error);
    });
  }, [user?.id, isConfigured, identify]);

  // Refresh subscription on user change, config ready, or status change
  useEffect(() => {
    if (user?.id) {
      refreshSubscription();
    } else {
      setPlan('free');
      setIsLoading(false);
    }
  }, [user?.id, isConfigured, subscriptionStatus?.status]);

  const isPaid = plan === 'pro' || plan === 'lifetime';

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        isPaid,
        isLoading,
        showPaywall,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
