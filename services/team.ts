import { supabase } from '@/supabase';
import type { Team } from '@/types/database.example';

export const teamService = {
  async getTeamsByGroupId(groupId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Team[];
  },

  async createTeam(groupId: string, name: string, color: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({ group_id: groupId, name, color })
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  },

  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  },

  async assignParticipantToTeam(participantId: string, teamId: string): Promise<void> {
    const { error } = await supabase
      .from('challenge_participants')
      .update({ team_id: teamId })
      .eq('id', participantId);

    if (error) throw error;
  },

  async removeParticipantFromTeam(participantId: string): Promise<void> {
    const { error } = await supabase
      .from('challenge_participants')
      .update({ team_id: null })
      .eq('id', participantId);

    if (error) throw error;
  },

  async removeParticipantFromChallenge(participantId: string): Promise<void> {
    const { error } = await supabase
      .from('challenge_participants')
      .delete()
      .eq('id', participantId);

    if (error) throw error;
  },

  async getChallengeParticipants(challengeId: string) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('id, user_id, team_id, status, joined_at, current_streak, total_ability_points')
      .eq('challenge_id', challengeId)
      .in('status', ['active', 'completed'])
      .order('joined_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Fetch profile info for all participants
    const userIds = data.map((p) => p.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    if (profileError) throw profileError;

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p]),
    );

    return data.map((p) => ({
      ...p,
      display_name: profileMap.get(p.user_id)?.display_name ?? null,
      avatar_url: profileMap.get(p.user_id)?.avatar_url ?? null,
    }));
  },
};
