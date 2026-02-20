-- Migration: Auto-update challenges.participant_count on participant insert/delete
-- Keeps the cached participant_count in sync with actual challenge_participants rows

CREATE OR REPLACE FUNCTION public.update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE challenges
    SET participant_count = (
      SELECT COUNT(*) FROM challenge_participants
      WHERE challenge_id = NEW.challenge_id
    )
    WHERE id = NEW.challenge_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE challenges
    SET participant_count = (
      SELECT COUNT(*) FROM challenge_participants
      WHERE challenge_id = OLD.challenge_id
    )
    WHERE id = OLD.challenge_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on insert
CREATE TRIGGER on_participant_added
  AFTER INSERT ON public.challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_challenge_participant_count();

-- Trigger on delete
CREATE TRIGGER on_participant_removed
  AFTER DELETE ON public.challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_challenge_participant_count();
