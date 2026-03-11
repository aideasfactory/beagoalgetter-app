-- Migration 015: Sync challenge_participants.total_ability_points from post_ability_points
--
-- Root cause: challenge_participants.total_ability_points was never updated.
-- Migration 007 only updates profiles.total_ability_points (global total).
-- This migration adds triggers to keep the per-challenge participant total in sync.

-- ================================================
-- Function: recalculate total_ability_points for a specific user+challenge
-- ================================================
CREATE OR REPLACE FUNCTION recalculate_participant_ability_points(p_user_id UUID, p_challenge_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE challenge_participants
    SET total_ability_points = (
        SELECT COALESCE(SUM(pap.points), 0)
        FROM post_ability_points pap
        JOIN posts p ON p.id = pap.post_id
        WHERE p.user_id = p_user_id
          AND p.challenge_id = p_challenge_id
    )
    WHERE user_id = p_user_id
      AND challenge_id = p_challenge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Trigger function: on post_ability_points change, update the participant's total
-- ================================================
CREATE OR REPLACE FUNCTION trigger_recalculate_participant_points()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner UUID;
    v_challenge_id UUID;
BEGIN
    SELECT user_id, challenge_id INTO v_post_owner, v_challenge_id
    FROM posts
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);

    IF v_post_owner IS NOT NULL AND v_challenge_id IS NOT NULL THEN
        PERFORM recalculate_participant_ability_points(v_post_owner, v_challenge_id);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Triggers on post_ability_points
-- ================================================
DROP TRIGGER IF EXISTS on_ability_points_participant_recalc_insert ON post_ability_points;
CREATE TRIGGER on_ability_points_participant_recalc_insert
    AFTER INSERT ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_participant_points();

DROP TRIGGER IF EXISTS on_ability_points_participant_recalc_update ON post_ability_points;
CREATE TRIGGER on_ability_points_participant_recalc_update
    AFTER UPDATE ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_participant_points();

DROP TRIGGER IF EXISTS on_ability_points_participant_recalc_delete ON post_ability_points;
CREATE TRIGGER on_ability_points_participant_recalc_delete
    AFTER DELETE ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_participant_points();

-- ================================================
-- Backfill: recalculate all existing participant totals
-- ================================================
UPDATE challenge_participants cp
SET total_ability_points = (
    SELECT COALESCE(SUM(pap.points), 0)
    FROM post_ability_points pap
    JOIN posts p ON p.id = pap.post_id
    WHERE p.user_id = cp.user_id
      AND p.challenge_id = cp.challenge_id
);
