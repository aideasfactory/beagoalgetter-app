import { supabase } from '@/supabase';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/types/database.example';

export const leaderboardService = {
  async getIndividualLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('challenge_leaderboard')
      .select('*')
      .eq('challenge_id', challengeId)
      .in('status', ['active', 'completed'])
      .order('rank', { ascending: true });

    if (error) throw error;
    return (data ?? []) as LeaderboardEntry[];
  },

  async getTeamLeaderboard(challengeId: string): Promise<TeamLeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('challenge_team_leaderboard')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('rank', { ascending: true });

    if (error) throw error;
    return (data ?? []) as TeamLeaderboardEntry[];
  },
};
