import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase';
import { useSession } from '@/context/auth';

export interface ChallengeDetail {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: 'personal' | 'group';
  status: string;
  start_date: string | null;
  end_date: string | null;
  duration: number;
  duration_type: 'days' | 'weeks';
  participant_count: number;
  created_by: string;
  // Computed fields
  progress: number;
  daysCompleted: number;
  totalDays: number;
  daysRemaining: number;
  // From challenge_participants
  currentStreak: number;
  totalPoints: number;
}

interface RawChallengeRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: 'personal' | 'group';
  status: string;
  start_date: string | null;
  end_date: string | null;
  duration: number;
  duration_type: 'days' | 'weeks';
  participant_count: number;
  created_by: string;
}

interface RawParticipantRow {
  current_streak: number;
  total_ability_points: number;
}

function computeProgress(
  startDate: string | null,
  duration: number,
  durationType: 'days' | 'weeks',
): { progress: number; daysCompleted: number; totalDays: number; daysRemaining: number } {
  const totalDays = durationType === 'weeks' ? duration * 7 : duration;

  if (!startDate) {
    return { progress: 0, daysCompleted: 0, totalDays, daysRemaining: totalDays };
  }

  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - start.getTime();
  const elapsedDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const daysCompleted = Math.min(elapsedDays, totalDays);
  const progress = totalDays > 0 ? Math.min(100, Math.round((daysCompleted / totalDays) * 100)) : 0;
  const daysRemaining = Math.max(0, totalDays - daysCompleted);

  return { progress, daysCompleted, totalDays, daysRemaining };
}

export function useChallengeDetail(challengeId: string) {
  const { user } = useSession();
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = useCallback(async () => {
    if (!challengeId || !user?.id) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Fetch challenge data and participant data in parallel
      const [challengeResult, participantResult] = await Promise.all([
        supabase
          .from('challenges')
          .select('id, title, description, image_url, type, status, start_date, end_date, duration, duration_type, participant_count, created_by')
          .eq('id', challengeId)
          .single(),
        supabase
          .from('challenge_participants')
          .select('current_streak, total_ability_points')
          .eq('challenge_id', challengeId)
          .eq('user_id', user.id)
          .single(),
      ]);

      if (challengeResult.error) throw challengeResult.error;

      const c = challengeResult.data as RawChallengeRow;
      const p = (participantResult.data as RawParticipantRow) || { current_streak: 0, total_ability_points: 0 };

      const { progress, daysCompleted, totalDays, daysRemaining } = computeProgress(
        c.start_date,
        c.duration,
        c.duration_type,
      );

      setChallenge({
        id: c.id,
        title: c.title,
        description: c.description,
        image_url: c.image_url,
        type: c.type,
        status: c.status,
        start_date: c.start_date,
        end_date: c.end_date,
        duration: c.duration,
        duration_type: c.duration_type,
        participant_count: Math.max(c.participant_count, 1),
        created_by: c.created_by,
        progress,
        daysCompleted,
        totalDays,
        daysRemaining,
        currentStreak: p.current_streak,
        totalPoints: p.total_ability_points,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  }, [challengeId, user?.id]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  return { challenge, loading, error, refetch: fetchChallenge };
}
