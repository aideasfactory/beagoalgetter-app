-- Migration 007: Auto-recalculate profile stats and badges via triggers
-- Keeps profiles.current_streak, longest_streak, challenges_completed,
-- active_challenges, total_challenges, total_ability_points in sync
-- by aggregating from challenge_participants and post_ability_points.
-- Also updates badges: first_challenge, streak_7_days, streak_30_days, streak_100_days, perfect_month.

-- ================================================
-- Core function: recalculate all profile stats for a user
-- ================================================
CREATE OR REPLACE FUNCTION recalculate_profile_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_challenges INTEGER;
    v_longest_streak INTEGER;
    v_perfect_challenge BOOLEAN;
BEGIN
    -- Compute values we need for both stats and badges
    SELECT COUNT(*) INTO v_total_challenges
    FROM challenge_participants cp
    WHERE cp.user_id = p_user_id;

    SELECT COALESCE(MAX(cp.longest_streak), 0) INTO v_longest_streak
    FROM challenge_participants cp
    WHERE cp.user_id = p_user_id;

    -- Check if user has completed any challenge with a perfect streak (no missed days)
    SELECT EXISTS(
        SELECT 1
        FROM challenge_participants cp
        JOIN challenges c ON c.id = cp.challenge_id
        WHERE cp.user_id = p_user_id
          AND cp.status = 'completed'
          AND cp.longest_streak >= CASE
              WHEN c.duration_type = 'weeks' THEN c.duration * 7
              ELSE c.duration
          END
    ) INTO v_perfect_challenge;

    UPDATE profiles
    SET
        current_streak = (
            SELECT COALESCE(MAX(cp.current_streak), 0)
            FROM challenge_participants cp
            WHERE cp.user_id = p_user_id AND cp.status = 'active'
        ),
        longest_streak = v_longest_streak,
        challenges_completed = (
            SELECT COUNT(*)
            FROM challenge_participants cp
            WHERE cp.user_id = p_user_id AND cp.status = 'completed'
        ),
        active_challenges = (
            SELECT COUNT(*)
            FROM challenge_participants cp
            WHERE cp.user_id = p_user_id AND cp.status = 'active'
        ),
        total_challenges = v_total_challenges,
        total_ability_points = (
            SELECT COALESCE(SUM(pap.points), 0)
            FROM post_ability_points pap
            JOIN posts p ON p.id = pap.post_id
            WHERE p.user_id = p_user_id
        ),
        -- Update badges (once earned, never revoked — OR with existing value)
        badges = jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            badges,
                            '{first_challenge}',
                            to_jsonb(COALESCE((badges->>'first_challenge')::boolean, false) OR v_total_challenges >= 1)
                        ),
                        '{streak_7_days}',
                        to_jsonb(COALESCE((badges->>'streak_7_days')::boolean, false) OR v_longest_streak >= 7)
                    ),
                    '{streak_30_days}',
                    to_jsonb(COALESCE((badges->>'streak_30_days')::boolean, false) OR v_longest_streak >= 30)
                ),
                '{streak_100_days}',
                to_jsonb(COALESCE((badges->>'streak_100_days')::boolean, false) OR v_longest_streak >= 100)
            ),
            '{perfect_month}',
            to_jsonb(COALESCE((badges->>'perfect_month')::boolean, false) OR v_perfect_challenge)
        )
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Trigger function for challenge_participants changes
-- ================================================
CREATE OR REPLACE FUNCTION trigger_recalculate_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_profile_stats(OLD.user_id);
    ELSE
        PERFORM recalculate_profile_stats(NEW.user_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_participant_inserted ON challenge_participants;
CREATE TRIGGER on_participant_inserted
    AFTER INSERT ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_profile_stats();

DROP TRIGGER IF EXISTS on_participant_updated ON challenge_participants;
CREATE TRIGGER on_participant_updated
    AFTER UPDATE ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_profile_stats();

DROP TRIGGER IF EXISTS on_participant_deleted ON challenge_participants;
CREATE TRIGGER on_participant_deleted
    AFTER DELETE ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_profile_stats();

-- ================================================
-- Trigger function for post_ability_points changes
-- Looks up the post author and recalculates their stats
-- ================================================
CREATE OR REPLACE FUNCTION trigger_recalculate_profile_stats_from_points()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner UUID;
BEGIN
    SELECT user_id INTO v_post_owner
    FROM posts
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);

    IF v_post_owner IS NOT NULL THEN
        PERFORM recalculate_profile_stats(v_post_owner);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ability_points_profile_recalc_insert ON post_ability_points;
CREATE TRIGGER on_ability_points_profile_recalc_insert
    AFTER INSERT ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_profile_stats_from_points();

DROP TRIGGER IF EXISTS on_ability_points_profile_recalc_update ON post_ability_points;
CREATE TRIGGER on_ability_points_profile_recalc_update
    AFTER UPDATE ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_profile_stats_from_points();

DROP TRIGGER IF EXISTS on_ability_points_profile_recalc_delete ON post_ability_points;
CREATE TRIGGER on_ability_points_profile_recalc_delete
    AFTER DELETE ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_profile_stats_from_points();
