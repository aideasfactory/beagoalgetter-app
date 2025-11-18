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
      // Get subscription status from Superwall
      const status = await Superwall.shared.getSubscriptionStatus();
      console.log('Superwall subscription status:', status);

      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan, subscription_expires_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Determine plan based on Superwall status and DB state
      let currentPlan: 'free' | 'pro' | 'lifetime' = 'free';
      
      if (profile?.plan === 'lifetime') {
        currentPlan = 'lifetime';
      } else if (status === 'active' || status === 'trial') {
        currentPlan = 'pro';
        
        // Sync DB if it's out of date
        if (profile?.plan !== 'pro') {
          await supabase
            .from('profiles')
            .update({ plan: 'pro', updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      } else {
        // Check if subscription expired
        if (profile?.subscription_expires_at) {
          const expiresAt = new Date(profile.subscription_expires_at);
          if (expiresAt < new Date()) {
            // Subscription expired, update DB
            await supabase
              .from('profiles')
              .update({ 
                plan: 'free', 
                subscription_expires_at: null,
                updated_at: new Date().toISOString() 
              })
              .eq('id', user.id);
          }
        }
        currentPlan = 'free';
      }

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
