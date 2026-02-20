-- Migration 009: Add is_challenge_complete flag to posts
-- Identifies congratulatory posts created when a user finishes all days of a challenge.
-- Used by the feed UI to show a green "Completed" ribbon instead of blue "Done".

-- 1. Add the column
ALTER TABLE posts
  ADD COLUMN is_challenge_complete BOOLEAN NOT NULL DEFAULT false;

-- 2. Recreate the view to include the new column
DROP VIEW IF EXISTS posts_with_details;

CREATE VIEW posts_with_details AS
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
    COALESCE(
        (SELECT SUM(pap.points) FROM post_ability_points pap WHERE pap.post_id = p.id),
        0
    )::INTEGER as ability_points_given,
    pr.display_name as user_name,
    pr.avatar_url as user_avatar,
    pr.username as user_username,
    pr.longest_streak as user_streak,
    pr.total_ability_points as user_ability_points,
    c.title as challenge_title,
    c.type as challenge_type,
    c.participant_count as challenge_participant_count,
    c.group_id as group_id,
    g.name as group_name,
    g.logo as group_logo,
    g.color as group_color
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN challenges c ON p.challenge_id = c.id
LEFT JOIN groups g ON c.group_id = g.id;
