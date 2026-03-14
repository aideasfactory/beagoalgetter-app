-- Migration 020: Auto-create notification when someone comments on a post
-- Adds 'comment' to notification_type enum and creates a trigger on post_comments

-- 1. Add 'comment' to notification_type enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'comment';

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION notify_post_author_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_author_id UUID;
  v_commenter_name TEXT;
BEGIN
  -- Get the post author
  SELECT user_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Skip if commenter is the post author (no self-notifications)
  IF v_post_author_id IS NULL OR v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter display name
  SELECT COALESCE(display_name, 'Someone') INTO v_commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Insert notification for the post author
  INSERT INTO notifications (user_id, type, message, from_user_id, post_id)
  VALUES (
    v_post_author_id,
    'comment',
    v_commenter_name || ' commented on your post',
    NEW.user_id,
    NEW.post_id
  );

  RETURN NEW;
END;
$$;

-- 3. Create trigger on post_comments
CREATE TRIGGER on_post_comment_notify_author
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_author_on_comment();
