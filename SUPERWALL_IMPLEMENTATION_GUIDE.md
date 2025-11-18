# Superwall Subscription Implementation Guide
**Goal Getter App - Complete Implementation Plan**

---

## 📋 Overview

This guide covers the complete implementation of Superwall subscription management for the Goal Getter app. The system uses:

- **Superwall SDK** (already installed via `expo-superwall`)
- **Supabase Edge Functions** for webhook handling
- **Client-side subscription sync** on app launch
- **Local entitlements context** for feature gating

**Paywalled Feature (Phase 1):** Creating Group Challenges

---

## 🗂️ Table of Contents

1. [Database Changes](#1-database-changes)
2. [Supabase Edge Function (Webhook)](#2-supabase-edge-function-webhook)
3. [Subscription Context & Hook](#3-subscription-context--hook)
4. [Client-Side Sync](#4-client-side-sync)
5. [Feature Gating Implementation](#5-feature-gating-implementation)
6. [Testing Checklist](#6-testing-checklist)
7. [Future Enhancements](#7-future-enhancements)

---

## 1. Database Changes

### 1.1 Migration SQL

Create a new migration file:

**File:** `supabase/migrations/002_add_subscription_fields.sql`

```sql
-- Remove old is_premium field and add new subscription fields
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS is_premium;

ALTER TABLE profiles
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime')),
  ADD COLUMN superwall_user_id TEXT,
  ADD COLUMN current_product_id TEXT,
  ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Index for faster lookups
CREATE INDEX idx_profiles_plan ON profiles(plan);
CREATE INDEX idx_profiles_superwall_user_id ON profiles(superwall_user_id);

-- Add helpful comment
COMMENT ON COLUMN profiles.plan IS 'Subscription plan: free, pro, or lifetime';
COMMENT ON COLUMN profiles.superwall_user_id IS 'User ID from Superwall (usually matches auth user ID)';
COMMENT ON COLUMN profiles.current_product_id IS 'Current active product ID from App Store/Play Store';
COMMENT ON COLUMN profiles.subscription_expires_at IS 'When the current subscription period ends (null for lifetime)';
```

### 1.2 Update schema.sql

**File:** `supabase/schema.sql`

Find the `CREATE TABLE profiles` section and update:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    username TEXT UNIQUE,
    longest_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    total_ability_points INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    active_challenges INTEGER DEFAULT 0,
    total_challenges INTEGER DEFAULT 0,
    date_of_birth DATE,
    notification_preferences JSONB DEFAULT '{}',
    badges JSONB NOT NULL DEFAULT '{
      "first_challenge": false,
      "streak_7_days": false,
      "streak_30_days": false,
      "team_player": false,
      "streak_100_days": false,
      "perfect_month": false
    }'::jsonb,
    push_token TEXT,
    device TEXT CHECK (device IN ('ios', 'android')),
    
    -- Subscription fields (UPDATED)
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime')),
    superwall_user_id TEXT,
    current_product_id TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for subscription fields
CREATE INDEX idx_profiles_plan ON profiles(plan);
CREATE INDEX idx_profiles_superwall_user_id ON profiles(superwall_user_id);
```

### 1.3 Update TypeScript Types

**File:** `types/database.example.ts`

Update the `Profile` interface:

```typescript
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  username: string | null;
  
  // Subscription fields (UPDATED)
  plan: 'free' | 'pro' | 'lifetime';
  superwall_user_id: string | null;
  current_product_id: string | null;
  subscription_expires_at: string | null;
  
  longest_streak: number;
  current_streak: number;
  total_ability_points: number;
  challenges_completed: number;
  active_challenges: number;
  total_challenges: number;
  badges: ProfileBadges | null;
  created_at: string;
  updated_at: string;
}
```

---

## 2. Supabase Edge Function (Webhook)

### 2.1 Create Edge Function

**Directory structure:**
```
supabase/
  functions/
    superwall-webhook/
      index.ts
```

**File:** `supabase/functions/superwall-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface SuperwallWebhookEvent {
  event_name: string;
  user_id: string;
  app_user_id: string;
  product_id?: string;
  subscription_status?: string;
  expires_date?: string;
  is_trial_period?: boolean;
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const payload: SuperwallWebhookEvent = await req.json();

    console.log("Received Superwall webhook:", payload);

    const userId = payload.app_user_id || payload.user_id;

    // Handle different webhook events
    switch (payload.event_name) {
      case "subscription_start":
      case "trial_start":
        await supabase
          .from("profiles")
          .update({
            plan: "pro",
            superwall_user_id: payload.user_id,
            current_product_id: payload.product_id,
            subscription_expires_at: payload.expires_date,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;

      case "subscription_renew":
        await supabase
          .from("profiles")
          .update({
            subscription_expires_at: payload.expires_date,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;

      case "subscription_cancel":
      case "subscription_expire":
        await supabase
          .from("profiles")
          .update({
            plan: "free",
            current_product_id: null,
            subscription_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;

      case "non_renewing_purchase":
        // Handle lifetime/one-time purchases
        await supabase
          .from("profiles")
          .update({
            plan: "lifetime",
            superwall_user_id: payload.user_id,
            current_product_id: payload.product_id,
            subscription_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;

      default:
        console.log("Unhandled event:", payload.event_name);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
```

### 2.2 Deploy Edge Function

Run these commands in your terminal:

```bash
# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy superwall-webhook

# Get the function URL (will be something like):
# https://YOUR_PROJECT_REF.supabase.co/functions/v1/superwall-webhook
```

### 2.3 Configure Superwall Webhook

1. Go to [Superwall Dashboard](https://superwall.com/dashboard)
2. Navigate to Settings → Webhooks
3. Add your webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/superwall-webhook
   ```
4. Enable these events:
   - `subscription_start`
   - `trial_start`
   - `subscription_renew`
   - `subscription_cancel`
   - `subscription_expire`
   - `non_renewing_purchase`

---

## 3. Subscription Context & Hook

### 3.1 Create Subscription Context

**File:** `context/subscription.tsx`

```typescript
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
```

### 3.2 Update Context Index

**File:** `context/index.ts`

```typescript
export { useSession, SessionProvider } from './auth';
export { useSubscription, SubscriptionProvider } from './subscription';
```

### 3.3 Wrap App with Subscription Provider

**File:** `app/_layout.tsx`

Update the Root component to include SubscriptionProvider:

```typescript
import { SubscriptionProvider } from '@/context';

// ... existing code ...

return (
  <I18nextProvider i18n={i18n}>
    <SessionProvider>
      <SubscriptionProvider>
        <RootNavigator />
      </SubscriptionProvider>
    </SessionProvider>
  </I18nextProvider>
);
```

---

## 4. Client-Side Sync

The subscription sync happens automatically when:
1. **App launches** - The `SubscriptionProvider` calls `refreshSubscription()` on mount
2. **User signs in** - When `user.id` changes, the effect triggers
3. **After paywall dismissal** - `showPaywall()` calls `refreshSubscription()` after closing

You can also manually trigger sync by calling `refreshSubscription()` from the hook.

---

## 5. Feature Gating Implementation

### 5.1 Gate Group Challenge Creation

**File:** `components/create-challenge/Step1Basics.tsx`

Add paywall check when selecting group challenge type:

```typescript
import { useSubscription } from '@/context';

export function Step1Basics({ data, onUpdate }: Step1BasicsProps) {
  const { isPaid, showPaywall } = useSubscription();
  
  // ... existing code ...

  const handleChallengeTypeSelect = async (type: 'personal' | 'group') => {
    if (type === 'group' && !isPaid) {
      // Show paywall instead of allowing selection
      await showPaywall('goalgetter');
      return;
    }
    onUpdate({ challengeType: type });
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-6">
      {/* ... existing code ... */}

      {/* Challenge Type */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Challenge Type *</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleChallengeTypeSelect('personal')}
            className={`flex-1 p-4 rounded-xl border-2 ${
              data.challengeType === 'personal'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/20 bg-white/5'
            }`}
          >
            <View className="items-center">
              <Ionicons
                name="person-outline"
                size={32}
                color={data.challengeType === 'personal' ? '#3B82F6' : 'rgba(255,255,255,0.6)'}
              />
              <Text
                className={`mt-2 font-medium ${
                  data.challengeType === 'personal' ? 'text-blue-500' : 'text-white/60'
                }`}
              >
                Personal
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleChallengeTypeSelect('group')}
            className={`flex-1 p-4 rounded-xl border-2 ${
              data.challengeType === 'group'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/20 bg-white/5'
            }`}
          >
            <View className="items-center">
              <View className="flex-row items-center">
                <Ionicons
                  name="people-outline"
                  size={32}
                  color={data.challengeType === 'group' ? '#3B82F6' : 'rgba(255,255,255,0.6)'}
                />
                {!isPaid && (
                  <View className="ml-1 -mt-4">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                  </View>
                )}
              </View>
              <Text
                className={`mt-2 font-medium ${
                  data.challengeType === 'group' ? 'text-blue-500' : 'text-white/60'
                }`}
              >
                Group
              </Text>
              {!isPaid && (
                <Text className="text-xs text-amber-500 mt-1">Pro</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ... rest of existing code ... */}
    </ScrollView>
  );
}
```

### 5.2 Add Badge to Locked Features

For visual indication of premium features, you can create a reusable badge component:

**File:** `components/ProBadge.tsx`

```typescript
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function ProBadge({ size = 'small' }: { size?: 'small' | 'medium' }) {
  const iconSize = size === 'small' ? 12 : 16;
  const textClass = size === 'small' ? 'text-xs' : 'text-sm';

  return (
    <View className="flex-row items-center bg-amber-500/20 px-2 py-1 rounded-full">
      <Ionicons name="star" size={iconSize} color="#F59E0B" />
      <Text className={`${textClass} text-amber-500 font-semibold ml-1`}>PRO</Text>
    </View>
  );
}
```

---

## 6. Testing Checklist

### 6.1 Database Migration
- [ ] Run migration: `npx supabase db push`
- [ ] Verify new columns exist in profiles table
- [ ] Verify old `is_premium` column is removed
- [ ] Check indexes are created

### 6.2 Edge Function
- [ ] Deploy edge function successfully
- [ ] Test webhook URL is accessible
- [ ] Configure webhook in Superwall dashboard
- [ ] Test webhook with Superwall test events

### 6.3 Subscription Context
- [ ] App loads without errors
- [ ] Subscription context wraps the app correctly
- [ ] User ID is set in Superwall on login
- [ ] `refreshSubscription()` runs on app launch
- [ ] Plan state updates correctly

### 6.4 Feature Gating
- [ ] Free users see "Pro" badge on group challenges
- [ ] Tapping group challenge shows paywall
- [ ] After purchase, group challenges become accessible
- [ ] Personal challenges remain accessible to all users

### 6.5 Purchase Flow
- [ ] Paywall appears with correct placement
- [ ] Can complete a test purchase
- [ ] Webhook receives purchase event
- [ ] Database updates with new subscription
- [ ] App UI updates to show pro features
- [ ] `refreshSubscription()` works after purchase

### 6.6 Expiration Handling
- [ ] Expired subscriptions are detected
- [ ] Database updates when subscription expires
- [ ] User loses access to pro features
- [ ] Paywall appears again for gated features

---

## 7. Future Enhancements

### Phase 2 Features (After Group Challenges Work)
1. **Additional Paywalled Features:**
   - Advanced analytics
   - Custom challenge themes
   - Priority support
   - Ad removal

2. **Multiple Tiers:**
   - Basic Pro plan
   - Premium plan with extra features
   - Team/Organization plans

3. **Entitlements System:**
   - Move entitlements to Redis for faster API checks
   - Create backend middleware for API protection
   - Add feature flags system

4. **Analytics:**
   - Track paywall conversion rates
   - Monitor subscription churn
   - A/B test different paywall placements

### Backend Protection (Important!)
Once you have API endpoints that should be protected:

```typescript
// Example API middleware (if you build a backend)
async function requireSubscription(req, res, next) {
  const userId = req.auth.userId;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  
  if (profile?.plan === 'free') {
    return res.status(402).json({ error: 'Subscription required' });
  }
  
  next();
}
```

For now, since most actions happen client-side, the client-side gating is sufficient.

---

## 8. Key Implementation Files Summary

| File | Purpose |
|------|---------|
| `supabase/migrations/002_add_subscription_fields.sql` | Database migration |
| `supabase/schema.sql` | Updated schema definition |
| `types/database.example.ts` | TypeScript types for Profile |
| `supabase/functions/superwall-webhook/index.ts` | Webhook handler |
| `context/subscription.tsx` | Subscription state management |
| `context/index.ts` | Export subscription context |
| `app/_layout.tsx` | Wrap app with SubscriptionProvider |
| `components/create-challenge/Step1Basics.tsx` | Gate group challenges |
| `components/ProBadge.tsx` | Visual indicator for pro features |

---

## 9. Configuration Values Needed

Before deploying, ensure you have:

- ✅ Superwall API keys (iOS & Android) - already in `Settings.ts`
- ✅ Superwall campaign with "goalgetter" placement - confirmed ready
- ✅ Product IDs configured in Superwall - confirmed ready
- ⚠️ Supabase project ref for edge function deployment
- ⚠️ Edge function URL for Superwall webhook configuration

---

## 10. Troubleshooting

### Subscription not updating after purchase
- Check Superwall webhook is configured correctly
- Check edge function logs: `npx supabase functions logs superwall-webhook`
- Verify user ID matches between Superwall and your auth system
- Call `refreshSubscription()` manually to force sync

### Paywall not showing
- Verify Superwall is initialized in `_layout.tsx`
- Check placement name is correct ("goalgetter")
- Ensure user is not in Expo Go (Superwall doesn't work in Expo Go)
- Check console for Superwall errors

### Database not updating
- Verify edge function has correct service role key
- Check edge function logs for errors
- Verify webhook events are enabled in Superwall
- Test webhook manually with curl

---

**Next Steps:** Start with Section 1 (Database Changes), then proceed sequentially through each section. Test thoroughly after each major component is implemented.
