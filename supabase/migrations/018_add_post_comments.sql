-- Migration 018: Add post comments
-- Creates post_comments table, adds comments_count to posts,
-- auto-update trigger, and updates posts_with_details view.

-- 1. Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.post_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Add cached comments_count column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 6. Trigger functions to auto-update comments_count
CREATE OR REPLACE FUNCTION public.increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Triggers
CREATE TRIGGER on_post_comment_added
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_comments();

CREATE TRIGGER on_post_comment_removed
  AFTER DELETE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_post_comments();

-- 8. Backfill comments_count (in case any comments already exist — safety measure)
UPDATE public.posts p
SET comments_count = (
  SELECT COUNT(*) FROM public.post_comments pc WHERE pc.post_id = p.id
);

-- 9. Update posts_with_details view to include comments_count
CREATE OR REPLACE VIEW public.posts_with_details AS
SELECT
  p.id,
  p.user_id,
  p.challenge_id,
  p.message,
  p.note,
  p.image_url,
  p.type,
  p.is_challenge_complete,
  p.created_at,
  p.likes_count,
  COALESCE(SUM(pap.points), 0)::INTEGER AS ability_points_given,
  p.comments_count,
  pr.display_name AS user_name,
  pr.avatar_url AS user_avatar,
  pr.username AS user_username,
  pr.current_streak AS user_streak,
  pr.total_ability_points AS user_ability_points,
  c.title AS challenge_title,
  c.type AS challenge_type,
  c.participant_count AS challenge_participant_count,
  c.start_date AS challenge_start_date,
  c.duration AS challenge_duration,
  c.duration_type AS challenge_duration_type,
  c.group_id AS group_id,
  g.name AS group_name,
  g.logo AS group_logo,
  g.color AS group_color
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
LEFT JOIN public.challenges c ON p.challenge_id = c.id
LEFT JOIN public.groups g ON c.group_id = g.id
LEFT JOIN public.post_ability_points pap ON p.id = pap.post_id
GROUP BY
  p.id, p.user_id, p.challenge_id, p.message, p.note, p.image_url,
  p.type, p.is_challenge_complete, p.created_at, p.likes_count,
  p.comments_count,
  pr.display_name, pr.avatar_url, pr.username, pr.current_streak, pr.total_ability_points,
  c.title, c.type, c.participant_count, c.start_date, c.duration, c.duration_type, c.group_id,
  g.name, g.logo, g.color;
