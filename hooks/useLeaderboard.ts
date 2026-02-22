import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '@/services/leaderboard';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/types/database.example';

interface UseLeaderboardResult {
  individuals: LeaderboardEntry[];
  teams: TeamLeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLeaderboard(challengeId: string): UseLeaderboardResult {
  const [individuals, setIndividuals] = useState<LeaderboardEntry[]>([]);
  const [teams, setTeams] = useState<TeamLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [individualData, teamData] = await Promise.all([
        leaderboardService.getIndividualLeaderboard(challengeId),
        leaderboardService.getTeamLeaderboard(challengeId),
      ]);

      setIndividuals(individualData);
      setTeams(teamData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { individuals, teams, loading, error, refetch: fetch };
}
