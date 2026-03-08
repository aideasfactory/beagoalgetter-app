-- Migration 014: Notification Preferences
-- Extends notification_type enum with 'achievement' and 'team_update' values
-- Creates get_opted_in_users function for preference-based notification filtering

-- 1. Extend notification_type enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'achievement';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'team_update';

-- 2. Create function to query users opted in for a specific notification type
-- Used server-side to filter push notification recipients by their preferences
-- Defaults to opted-in when preferences are empty (new users get all notifications)
CREATE OR REPLACE FUNCTION get_opted_in_users(target_type notification_type)
RETURNS TABLE (
  user_id UUID,
  push_token TEXT,
  device TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.push_token, p.device
  FROM profiles p
  WHERE p.push_token IS NOT NULL
    AND p.is_active = true
    AND (
      CASE
        WHEN target_type = 'achievement' THEN
          COALESCE((p.notification_preferences->>'push_enabled')::boolean, true)
          AND COALESCE((p.notification_preferences->>'achievement_alerts')::boolean, true)
        WHEN target_type = 'team_update' THEN
          COALESCE((p.notification_preferences->>'push_enabled')::boolean, true)
          AND COALESCE((p.notification_preferences->>'team_updates')::boolean, true)
        ELSE
          COALESCE((p.notification_preferences->>'push_enabled')::boolean, true)
      END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
