-- Migration 005: Update posts_with_details view to compute ability points from post_ability_points
-- Instead of relying on the trigger-maintained posts.ability_points_given cache,
-- compute the SUM directly from post_ability_points for accurate totals.

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
