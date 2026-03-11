-- Migration 015: Add subscription fields to profiles
-- Replaces is_premium boolean with full subscription tracking

-- Drop old boolean premium flag
ALTER TABLE profiles
  DROP COLUMN IF EXISTS is_premium;

-- Add subscription fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'lifetime')),
  ADD COLUMN IF NOT EXISTS superwall_user_id TEXT,
  ADD COLUMN IF NOT EXISTS current_product_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Indexes for subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_superwall_user_id ON profiles(superwall_user_id);

-- Column comments
COMMENT ON COLUMN profiles.plan IS 'Subscription plan: free, pro, or lifetime';
COMMENT ON COLUMN profiles.superwall_user_id IS 'User ID from Superwall';
COMMENT ON COLUMN profiles.current_product_id IS 'Active product ID from App Store/Play Store';
COMMENT ON COLUMN profiles.subscription_expires_at IS 'When subscription period ends (null for lifetime)';
