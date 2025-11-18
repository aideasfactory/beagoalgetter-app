# Superwall Implementation Status

## ✅ Completed Items

### 1. Subscription Context (`context/subscription.tsx`)
**Purpose:** This is how the app detects if a user is subscribed.

The subscription context:
- ✅ Checks Superwall's subscription status on app launch
- ✅ Syncs with the Supabase database  
- ✅ Provides `isPaid` boolean (true for 'pro' or 'lifetime' plans)
- ✅ Provides `showPaywall()` function to display paywalls
- ✅ Automatically refreshes after purchase
- ✅ Uses correct Superwall API: `Superwall.shared.identify()` and `Superwall.shared.register()`

**How it works:**
1. When app loads, `SubscriptionProvider` wraps the entire app
2. It calls Superwall to get subscription status
3. It checks the database for the user's `plan` field
4. It syncs them if they're out of date
5. Components use `useSubscription()` hook to access `isPaid` and `showPaywall()`

### 2. Updated TypeScript Types (`types/database.example.ts`)
- ✅ Removed `is_premium: boolean`
- ✅ Added subscription fields:
  - `plan: 'free' | 'pro' | 'lifetime'`
  - `superwall_user_id: string | null`
  - `current_product_id: string | null`
  - `subscription_expires_at: string | null`

### 3. Updated App Files
- ✅ `context/index.ts` - Exports subscription context
- ✅ `app/_layout.tsx` - Wraps app with `SubscriptionProvider`
- ✅ `app/(tabs)/profile/index.tsx` - Uses `useSubscription()` for create group paywall
- ✅ `app/(tabs)/profile/settings.tsx` - Uses `useSubscription()` for test paywall

### 4. Paywall Implementation on Create Group Button
**Location:** `app/(tabs)/profile/index.tsx`

The "Create New Group" button now:
- ✅ Checks `isPaid` from subscription context
- ✅ Shows paywall with placement "goalgetter" if user is not paid
- ✅ Opens create group modal if user is paid

---

## ⏳ Still Required (Database & Backend)

### 1. Database Migration
You need to run this migration on your Supabase database:

**File:** `supabase/migrations/002_add_subscription_fields.sql` (needs to be created)

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

-- Add helpful comments
COMMENT ON COLUMN profiles.plan IS 'Subscription plan: free, pro, or lifetime';
COMMENT ON COLUMN profiles.superwall_user_id IS 'User ID from Superwall (usually matches auth user ID)';
COMMENT ON COLUMN profiles.current_product_id IS 'Current active product ID from App Store/Play Store';
COMMENT ON COLUMN profiles.subscription_expires_at IS 'When the current subscription period ends (null for lifetime)';
```

**To run the migration:**
```bash
# Option 1: Run directly in Supabase dashboard SQL editor
# Copy the SQL above and run it in your Supabase project

# Option 2: Using Supabase CLI
npx supabase db push
```

### 2. Update schema.sql
The `supabase/schema.sql` file also needs to be updated to reflect these changes. Find the `CREATE TABLE profiles` section and replace the `is_premium BOOLEAN DEFAULT false,` line with:

```sql
-- Subscription fields
plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime')),
superwall_user_id TEXT,
current_product_id TEXT,
subscription_expires_at TIMESTAMP WITH TIME ZONE,
```

### 3. Supabase Edge Function (Webhook Handler)
**Purpose:** This keeps your database in sync when users purchase/cancel subscriptions.

You need to create and deploy a Supabase Edge Function that receives webhooks from Superwall.

**File to create:** `supabase/functions/superwall-webhook/index.ts`

See the full implementation in `SUPERWALL_IMPLEMENTATION_GUIDE.md` (Section 2).

**Steps:**
1. Create the edge function file
2. Deploy it: `npx supabase functions deploy superwall-webhook`
3. Get the function URL
4. Add the URL to Superwall dashboard webhooks settings
5. Enable these webhook events:
   - `subscription_start`
   - `trial_start`
   - `subscription_renew`
   - `subscription_cancel`
   - `subscription_expire`
   - `non_renewing_purchase`

---

## 🧪 Testing Checklist

Once the database migration is complete:

### Client-Side Testing
- [ ] App loads without errors
- [ ] Free user sees create group button
- [ ] Tapping create group button shows paywall with "goalgetter" placement
- [ ] After test purchase, create group button opens the modal
- [ ] Settings "Test Paywall" button works correctly

### Database Testing
- [ ] New columns exist in profiles table
- [ ] Old `is_premium` column is removed
- [ ] Indexes are created
- [ ] Default values work (new users get plan='free')

### Integration Testing (After Edge Function Deployed)
- [ ] Edge function URL is accessible
- [ ] Webhook is configured in Superwall dashboard
- [ ] Test purchase updates database
- [ ] Test cancellation updates database
- [ ] App UI updates after purchase

---

## 📝 Summary

### How Subscription Detection Works:

1. **On App Launch:**
   ```
   App loads → SubscriptionProvider initializes
   → Calls Superwall.getSubscriptionStatus()
   → Fetches user's plan from Supabase
   → Sets isPaid = (plan === 'pro' || plan === 'lifetime')
   → Components can now use isPaid
   ```

2. **When User Taps Create Group:**
   ```
   User taps "Create New Group"
   → handleCreateGroupPress() runs
   → Checks isPaid from useSubscription()
   → If NOT paid: showPaywall('goalgetter')
   → If paid: Open create group modal
   ```

3. **After Purchase:**
   ```
   User completes purchase in paywall
   → Superwall sends webhook to Edge Function
   → Edge Function updates database (plan = 'pro')
   → showPaywall() calls refreshSubscription()
   → App fetches updated plan from database
   → isPaid becomes true
   → User can now create groups
   ```

### Key Files Reference:
| File | Purpose |
|------|---------|
| `context/subscription.tsx` | Main subscription logic |
| `app/_layout.tsx` | Wraps app with provider |
| `app/(tabs)/profile/index.tsx` | Create group paywall |
| `types/database.example.ts` | TypeScript types |
| `SUPERWALL_IMPLEMENTATION_GUIDE.md` | Full implementation details |

---

## 🚀 Next Steps

1. **Run database migration** (see SQL above)
2. **Update schema.sql** for future reference
3. **Deploy edge function** (optional but recommended for webhook sync)
4. **Test on device** (Superwall doesn't work in Expo Go)

Once migration is complete, the paywall should work! The edge function can be added later for automatic webhook syncing, but the client-side sync will work on its own.
