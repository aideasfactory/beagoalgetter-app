-- Migration 008: Add days_completed column to challenge_participants
-- Tracks actual days that have been resolved (success or fail) rather than calendar elapsed time.
-- Incremented when user completes a day (success) or by cron job at midnight (fail).

-- 1. Add the column
ALTER TABLE challenge_participants
  ADD COLUMN days_completed INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill from existing task_completions
-- Count distinct completion dates per user per challenge
UPDATE challenge_participants cp
SET days_completed = COALESCE(sub.day_count, 0)
FROM (
  SELECT
    challenge_id,
    user_id,
    COUNT(DISTINCT DATE(completed_at AT TIME ZONE 'UTC')) as day_count
  FROM task_completions
  GROUP BY challenge_id, user_id
) sub
WHERE cp.challenge_id = sub.challenge_id
  AND cp.user_id = sub.user_id;
