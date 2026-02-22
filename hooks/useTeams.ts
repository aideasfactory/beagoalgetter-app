import { useState, useEffect, useCallback } from 'react';
import { teamService } from '@/services/team';
import type { Team } from '@/types/database.example';

export interface ParticipantWithProfile {
  id: string;
  user_id: string;
  team_id: string | null;
  status: string;
  joined_at: string;
  current_streak: number;
  total_ability_points: number;
  display_name: string | null;
  avatar_url: string | null;
}

interface UseTeamsResult {
  teams: Team[];
  participants: ParticipantWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTeam: (name: string, color: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  assignToTeam: (participantId: string, teamId: string) => Promise<void>;
  removeFromTeam: (participantId: string) => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
}

export function useTeams(challengeId: string, groupId: string | null): UseTeamsResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([]);
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
      const participantData = await teamService.getChallengeParticipants(challengeId);
      setParticipants(participantData as ParticipantWithProfile[]);

      if (groupId) {
        const teamData = await teamService.getTeamsByGroupId(groupId);
        setTeams(teamData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [challengeId, groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createTeam = useCallback(async (name: string, color: string) => {
    if (!groupId) throw new Error('No group ID');
    await teamService.createTeam(groupId, name, color);
    await fetch();
  }, [groupId, fetch]);

  const deleteTeam = useCallback(async (teamId: string) => {
    await teamService.deleteTeam(teamId);
    await fetch();
  }, [fetch]);

  const assignToTeam = useCallback(async (participantId: string, teamId: string) => {
    await teamService.assignParticipantToTeam(participantId, teamId);
    await fetch();
  }, [fetch]);

  const removeFromTeam = useCallback(async (participantId: string) => {
    await teamService.removeParticipantFromTeam(participantId);
    await fetch();
  }, [fetch]);

  const removeParticipant = useCallback(async (participantId: string) => {
    await teamService.removeParticipantFromChallenge(participantId);
    await fetch();
  }, [fetch]);

  return {
    teams,
    participants,
    loading,
    error,
    refetch: fetch,
    createTeam,
    deleteTeam,
    assignToTeam,
    removeFromTeam,
    removeParticipant,
  };
}
