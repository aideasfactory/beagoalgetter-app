-- Migration 003: Update posts_with_details view
-- Adds challenge_participant_count and group_id columns to the view
-- These are needed by the home feed to populate ChallengePreviewModal and GroupInfoModal

-- Drop and recreate since CREATE OR REPLACE cannot reorder/rename columns
DROP VIEW IF EXISTS posts_with_details;

CREATE VIEW posts_with_details AS
SELECT
    p.*,
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
