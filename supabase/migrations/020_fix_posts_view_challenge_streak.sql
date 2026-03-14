-- Migration 020: Fix posts_with_details view to show challenge-specific streak
-- Previously used pr.current_streak from profiles (user's overall streak).
-- Now uses cp.current_streak from challenge_participants (streak for that specific challenge).

DROP VIEW IF EXISTS public.posts_with_details;
CREATE VIEW public.posts_with_details AS
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
  COALESCE(cp.current_streak, 0) AS user_streak,
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
LEFT JOIN public.challenge_participants cp ON cp.user_id = p.user_id AND cp.challenge_id = p.challenge_id
LEFT JOIN public.post_ability_points pap ON p.id = pap.post_id
GROUP BY
  p.id, p.user_id, p.challenge_id, p.message, p.note, p.image_url,
  p.type, p.is_challenge_complete, p.created_at, p.likes_count,
  p.comments_count,
  pr.display_name, pr.avatar_url, pr.username, pr.total_ability_points,
  cp.current_streak,
  c.title, c.type, c.participant_count, c.start_date, c.duration, c.duration_type, c.group_id,
  g.name, g.logo, g.color;
