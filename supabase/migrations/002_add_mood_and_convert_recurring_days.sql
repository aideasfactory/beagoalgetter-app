-- Migration: Add mood to task_completions + convert recurring_days to ISO 8601 day numbers
-- Description:
--   1. Adds mood TEXT column to task_completions for tracking user mood on day completion
--      Values: 'very-sad', 'sad', 'neutral', 'happy', 'very-happy'
--   2. Converts recurring_days from lowercase day names to ISO 8601 day numbers (1=Mon, 7=Sun)
--      e.g., {'monday', 'friday'} → {'1', '5'}

-- 1. Add mood column to task_completions
ALTER TABLE task_completions
ADD COLUMN IF NOT EXISTS mood TEXT;

-- 2. Convert existing recurring_days from day names to ISO 8601 numbers
-- Only runs if there are rows with the old string format
UPDATE tasks
SET recurring_days = (
  SELECT ARRAY(
    SELECT CASE day
      WHEN 'monday'    THEN '1'
      WHEN 'tuesday'   THEN '2'
      WHEN 'wednesday' THEN '3'
      WHEN 'thursday'  THEN '4'
      WHEN 'friday'    THEN '5'
      WHEN 'saturday'  THEN '6'
      WHEN 'sunday'    THEN '7'
      ELSE day  -- leave already-numeric values unchanged
    END
    FROM unnest(recurring_days) AS day
  )
)
WHERE recurring_days != '{}'
  AND EXISTS (
    SELECT 1 FROM unnest(recurring_days) AS d
    WHERE d IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')
  );

-- Rollback:
-- ALTER TABLE task_completions DROP COLUMN IF EXISTS mood;
-- (recurring_days conversion is not easily reversible - keep a backup if needed)
