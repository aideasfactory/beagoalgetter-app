-- Migration 017: Nightly failed-post cron job
-- Creates a scheduled function that runs every night to auto-create "fail" posts
-- for users who missed their day in an active challenge.
--
-- Schedule: 5:00 AM UTC daily (≈ midnight EST)
-- Logic:
--   1. Find active participants in active challenges where yesterday was a valid challenge day
--   2. Check if required tasks were available on yesterday (recurring by day-of-week, non-recurring if not yet completed)
--   3. Skip users who already have a post (success or fail) for that challenge on yesterday
--   4. Create a fail post, increment days_completed, reset current_streak
--   5. Handle challenge completion if all days are now resolved

-- 1. Create the processing function
CREATE OR REPLACE FUNCTION process_nightly_failed_posts()
RETURNS void AS $$
DECLARE
  yesterday DATE := (CURRENT_DATE - INTERVAL '1 day')::DATE;
  yesterday_iso_day TEXT := EXTRACT(ISODOW FROM yesterday)::TEXT;
  rec RECORD;
  total_days INTEGER;
  has_required_tasks BOOLEAN;
BEGIN
  FOR rec IN
    SELECT
      cp.id AS participant_id,
      cp.user_id,
      cp.challenge_id,
      cp.days_completed,
      c.title AS challenge_title,
      c.duration,
      c.duration_type,
      c.start_date,
      c.end_date,
      c.type AS challenge_type
    FROM challenge_participants cp
    JOIN challenges c ON c.id = cp.challenge_id
    WHERE cp.status = 'active'
      AND c.status = 'active'
      AND c.start_date IS NOT NULL
      AND c.start_date <= yesterday
      -- Challenge must not have ended before yesterday
      AND COALESCE(
        c.end_date,
        (c.start_date + (
          CASE WHEN c.duration_type = 'weeks'
            THEN c.duration * 7
            ELSE c.duration
          END
        ) * INTERVAL '1 day')::DATE
      ) > yesterday
  LOOP
    -- Check if user has any required tasks available on yesterday
    SELECT EXISTS(
      SELECT 1 FROM tasks t
      WHERE t.challenge_id = rec.challenge_id
        AND t.is_active = true
        AND t.required = true
        AND (
          -- Recurring task: available if yesterday's day-of-week matches
          (t.is_recurring = true AND yesterday_iso_day = ANY(t.recurring_days))
          OR
          -- Non-recurring task: available if not yet completed by this user
          (t.is_recurring = false AND NOT EXISTS(
            SELECT 1 FROM task_completions tc
            WHERE tc.task_id = t.id
              AND tc.user_id = rec.user_id
          ))
        )
    ) INTO has_required_tasks;

    -- Skip if no required tasks were due yesterday
    IF NOT has_required_tasks THEN
      CONTINUE;
    END IF;

    -- Skip if user already has a post for this challenge on yesterday
    IF EXISTS(
      SELECT 1 FROM posts p
      WHERE p.user_id = rec.user_id
        AND p.challenge_id = rec.challenge_id
        AND (p.created_at AT TIME ZONE 'UTC')::DATE = yesterday
        AND p.type IN ('success', 'fail')
    ) THEN
      CONTINUE;
    END IF;

    -- Create the failed post
    INSERT INTO posts (user_id, challenge_id, message, type)
    VALUES (
      rec.user_id,
      rec.challenge_id,
      'Missed a day on ' || rec.challenge_title,
      'fail'
    );

    -- Increment days_completed and reset streak
    UPDATE challenge_participants
    SET days_completed = rec.days_completed + 1,
        current_streak = 0
    WHERE id = rec.participant_id;

    -- Check if challenge is now complete (all days resolved)
    total_days := CASE
      WHEN rec.duration_type = 'weeks' THEN rec.duration * 7
      ELSE rec.duration
    END;

    IF (rec.days_completed + 1) >= total_days THEN
      -- Mark participant as completed
      UPDATE challenge_participants
      SET status = 'completed'
      WHERE id = rec.participant_id;

      -- For personal challenges, also mark the challenge itself as completed
      IF rec.challenge_type = 'personal' THEN
        UPDATE challenges
        SET status = 'completed'
        WHERE id = rec.challenge_id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Schedule the cron job to run at 5:00 AM UTC daily
-- pg_cron is available by default on Supabase (paid plans)
SELECT cron.schedule(
  'nightly-failed-posts',
  '0 5 * * *',
  $$SELECT process_nightly_failed_posts()$$
);
