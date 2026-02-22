-- ================================================
-- Migration 013: Update Leaderboard Views
-- ================================================
-- Updates challenge_leaderboard view to include team info (team_name, team_color)
-- Creates challenge_team_leaderboard view for aggregated team standings per challenge
-- ================================================

-- 1. Drop and recreate challenge_leaderboard view to include team info
-- (CREATE OR REPLACE cannot reorder columns, so we must drop first)
DROP VIEW IF EXISTS challenge_leaderboard;
CREATE VIEW challenge_leaderboard AS
SELECT
    cp.*,
    pr.display_name,
    pr.avatar_url,
    pr.username,
    t.name AS team_name,
    t.color AS team_color,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.total_ability_points DESC, cp.current_streak DESC) AS rank
FROM challenge_participants cp
LEFT JOIN profiles pr ON cp.user_id = pr.id
LEFT JOIN teams t ON cp.team_id = t.id;

-- 2. Create challenge_team_leaderboard view for team standings
CREATE OR REPLACE VIEW challenge_team_leaderboard AS
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.color AS team_color,
    t.group_id,
    cp.challenge_id,
    COUNT(cp.user_id) FILTER (WHERE cp.status IN ('active', 'completed')) AS member_count,
    COALESCE(SUM(cp.total_ability_points) FILTER (WHERE cp.status IN ('active', 'completed')), 0) AS total_points,
    COALESCE(SUM(cp.current_streak) FILTER (WHERE cp.status IN ('active', 'completed')), 0) AS total_streak,
    RANK() OVER (
        PARTITION BY cp.challenge_id
        ORDER BY COALESCE(SUM(cp.total_ability_points) FILTER (WHERE cp.status IN ('active', 'completed')), 0) DESC
    ) AS rank
FROM teams t
LEFT JOIN challenge_participants cp ON t.id = cp.team_id
GROUP BY t.id, t.name, t.color, t.group_id, cp.challenge_id;
