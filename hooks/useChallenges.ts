import { useState, useCallback } from 'react';
import { supabase } from '@/supabase';
import { useSession } from '@/context/auth';
import type { Challenge } from '@/components/ChallengeCard';

interface ParticipantWithChallenge {
  current_streak: number;
  longest_streak: number;
  status: string;
  days_completed: number;
  challenges: {
    id: string;
    title: string;
    description: string | null;
    type: 'personal' | 'group';
    duration: number;
    duration_type: 'days' | 'weeks';
    start_date: string | null;
    end_date: string | null;
    status: string;
    participant_count: number;
    image_url: string | null;
    created_by: string | null;
    join_code: string | null;
  };
}

function formatEndDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function computeProgress(
  daysCompleted: number,
  duration: number,
  durationType: 'days' | 'weeks',
): { progress: number; daysCompleted: number; totalDays: number } {
  const totalDays = durationType === 'weeks' ? duration * 7 : duration;
  const clampedDaysCompleted = Math.min(daysCompleted, totalDays);
  const progress = totalDays > 0 ? Math.min(100, Math.round((clampedDaysCompleted / totalDays) * 100)) : 0;

  return { progress, daysCompleted: clampedDaysCompleted, totalDays };
}

function mapType(dbType: 'personal' | 'group'): 'Personal' | 'Group' {
  return dbType === 'personal' ? 'Personal' : 'Group';
}

function mapStatus(dbStatus: string): 'active' | 'completed' {
  return dbStatus === 'completed' ? 'completed' : 'active';
}

function mapToChallenge(row: ParticipantWithChallenge): Challenge {
  const c = row.challenges;
  const { progress, daysCompleted, totalDays } = computeProgress(
    row.days_completed,
    c.duration,
    c.duration_type,
  );

  return {
    id: c.id,
    title: c.title,
    description: c.description || '',
    image: c.image_url || '',
    type: mapType(c.type),
    progress,
    daysCompleted,
    totalDays,
    currentStreak: row.current_streak,
    members: Math.max(c.participant_count, 1),
    status: mapStatus(c.status),
    endDate: formatEndDate(c.end_date),
    isJoined: true,
  };
}

export function useChallenges() {
  const { user } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!user?.id) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: queryError } = await supabase
        .from('challenge_participants')
        .select(`
          current_streak,
          longest_streak,
          status,
          days_completed,
          challenges:challenge_id (
            id, title, description, type, duration, duration_type,
            start_date, end_date, status, participant_count,
            image_url, created_by, join_code
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'completed']);

      if (queryError) throw queryError;

      const mapped = (data as unknown as ParticipantWithChallenge[] || [])
        .filter((row) => row.challenges)
        .map(mapToChallenge);

      setChallenges(mapped);
    } catch (err: any) {
      setError(err?.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { challenges, loading, error, refetch: fetchChallenges };
}

export function useLookupByJoinCode() {
  const [loading, setLoading] = useState(false);

  const lookupByCode = useCallback(async (code: string): Promise<Challenge | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title, description, type, duration, duration_type, start_date, end_date, status, participant_count, image_url')
        .eq('join_code', code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const { progress, daysCompleted, totalDays } = computeProgress(
        0, // User hasn't joined yet, so 0 days completed
        data.duration,
        data.duration_type,
      );

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        image: data.image_url || '',
        type: mapType(data.type),
        progress,
        daysCompleted,
        totalDays,
        currentStreak: 0,
        members: Math.max(data.participant_count, 1),
        status: mapStatus(data.status),
        endDate: formatEndDate(data.end_date),
        isJoined: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookupByCode, loading };
}

export function useJoinChallenge() {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);

  const joinChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          status: 'active',
        });

      if (error) {
        if (error.code === '23505') {
          // Already joined (unique constraint violation)
          return true;
        }
        throw error;
      }

      // Create a "joined" post with the challenge image
      const { data: challenge } = await supabase
        .from('challenges')
        .select('title, image_url')
        .eq('id', challengeId)
        .single();

      if (challenge) {
        await supabase.from('posts').insert({
          user_id: user.id,
          challenge_id: challengeId,
          message: `Joined ${challenge.title}!`,
          image_url: challenge.image_url,
          type: 'joined',
        });
      }

      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { joinChallenge, loading };
}
