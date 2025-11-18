-- Migration: Add current_streak and badges columns to profiles
-- Description:
--   - Adds current_streak to track the user's current global streak
--   - Adds badges JSONB to track earned badge flags as booleans

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS badges JSONB NOT NULL DEFAULT '{
  "first_challenge": false,
  "streak_7_days": false,
  "streak_30_days": false,
  "team_player": false,
  "streak_100_days": false,
  "perfect_month": false
}'::jsonb;
