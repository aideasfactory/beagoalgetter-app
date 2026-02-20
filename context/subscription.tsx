import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '@/context/auth';
import Superwall from 'expo-superwall/compat';
import { supabase } from '@/supabase';
import type { Profile } from '@/types/database.example';

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

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [plan, setPlan] = useState<'free' | 'pro' | 'lifetime'>('free');
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user?.id) {
      setPlan('free');
      setIsLoading(false);
      return;
    }

    try {
      console.log('[Sub Debug] User ID:', user.id);

      // Fetch user profile from database first (most reliable)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan, subscription_expires_at')
        .eq('id', user.id)
        .single();

      console.log('[Sub Debug] DB profile:', JSON.stringify({ plan: profile?.plan, expires: profile?.subscription_expires_at }));
      console.log('[Sub Debug] DB error:', error);

      if (error) throw error;

      // Check DB plan first — lifetime is always authoritative from the DB
      if (profile?.plan === 'lifetime') {
        console.log('[Sub Debug] -> Resolved as LIFETIME (from DB)');
        setPlan('lifetime');
        return;
      }

      // Get subscription status from Superwall
      let superwallStatus: string = 'UNKNOWN';
      try {
        const status = await Superwall.shared.getSubscriptionStatus();
        superwallStatus = status.status;
        console.log('[Sub Debug] Superwall status:', JSON.stringify(status));
      } catch (swError) {
        console.log('[Sub Debug] Superwall error (falling back to DB):', swError);
      }

      // Determine plan based on Superwall status and DB state
      let currentPlan: 'free' | 'pro' | 'lifetime' = 'free';

      if (superwallStatus === 'ACTIVE') {
        console.log('[Sub Debug] -> Resolved as PRO (Superwall ACTIVE)');
        currentPlan = 'pro';

        // Sync DB if it's out of date
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
            console.log('[Sub Debug] -> Subscription expired, downgrading to FREE');
            await supabase
              .from('profiles')
              .update({
                plan: 'free',
                subscription_expires_at: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
          } else {
            console.log('[Sub Debug] -> Resolved as PRO (DB says pro, not yet expired)');
            currentPlan = 'pro';
          }
        } else {
          console.log('[Sub Debug] -> Resolved as FREE (DB says pro but Superwall inactive, no expiry)');
        }
      } else {
        console.log('[Sub Debug] -> Resolved as FREE (Superwall:', superwallStatus, ', DB:', profile?.plan, ')');
      }

      console.log('[Sub Debug] Final plan:', currentPlan, '| isPaid:', currentPlan === 'pro');
      setPlan(currentPlan);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setPlan('free');
    } finally {
      setIsLoading(false);
    }
  };

  const showPaywall = async (placement: string) => {
    try {
      await Superwall.shared.register({ placement });
      // After paywall dismisses, refresh subscription status
      await refreshSubscription();
    } catch (error) {
      console.error('Error showing paywall:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Identify user in Superwall
      Superwall.shared.identify({ userId: user.id }).catch((error) => {
        console.error('Error identifying user in Superwall:', error);
      });
      
      // Refresh subscription on mount
      refreshSubscription();
    } else {
      setPlan('free');
      setIsLoading(false);
    }
  }, [user?.id]);

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
