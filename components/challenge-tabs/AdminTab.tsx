import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTeams, type ParticipantWithProfile } from '@/hooks/useTeams';
import type { Team } from '@/types/database.example';

interface AdminTabProps {
  challengeId: string;
  groupId: string | null;
}

const presetTeamColors = [
  '#00c2ff', '#ec4899', '#84cc16', '#a855f7', '#f97316',
  '#14b8a6', '#eab308', '#ef4444', '#3b82f6', '#10b981',
];

type ModalView = 'list' | 'createTeam' | 'addMember';

export function AdminTab({ challengeId, groupId }: AdminTabProps) {
  const {
    teams,
    participants,
    loading,
    createTeam,
    deleteTeam,
    assignToTeam,
    removeParticipant,
    removeFromTeam,
  } = useTeams(challengeId, groupId);

  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'participants' | 'teams'>('participants');
  const [modalView, setModalView] = useState<ModalView>('list');
  const [teamForAdd, setTeamForAdd] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState<string>(presetTeamColors[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const handleOpenTeamsModal = () => {
    setActiveSection('participants');
    setModalView('list');
    setIsTeamsModalOpen(true);
  };

  const handleCloseTeamsModal = () => {
    setIsTeamsModalOpen(false);
    setModalView('list');
  };

  const getTeamNameForParticipant = (teamId: string | null) => {
    if (!teamId) return null;
    return teams.find((t) => t.id === teamId)?.name ?? null;
  };

  const formatJoinDate = (dateStr: string) => {
    const joinDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - joinDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getInitial = (name: string | null) => (name ? name.charAt(0).toUpperCase() : '?');

  const handleRemoveParticipant = (participant: ParticipantWithProfile) => {
    Alert.alert(
      'Remove participant',
      `Remove ${participant.display_name || 'this user'} from this challenge?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeParticipant(participant.id);
            } catch {
              Alert.alert('Error', 'Failed to remove participant.');
            }
          },
        },
      ],
    );
  };

  const openAddMemberView = (team: Team) => {
    setTeamForAdd(team);
    setModalView('addMember');
  };

  const handleAddParticipantToTeam = async (participantId: string) => {
    if (!teamForAdd) return;
    setIsSaving(true);
    try {
      await assignToTeam(participantId, teamForAdd.id);
      setModalView('list');
      setTeamForAdd(null);
    } catch {
      Alert.alert('Error', 'Failed to add participant to team.');
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateTeamView = () => {
    setNewTeamName('');
    setNewTeamColor(presetTeamColors[0]);
    setModalView('createTeam');
  };

  const handleCreateTeam = async () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName) {
      Alert.alert('Team name required', 'Please enter a name for the team.');
      return;
    }

    setIsSaving(true);
    try {
      await createTeam(trimmedName, newTeamColor);
      setModalView('list');
    } catch {
      Alert.alert('Error', 'Failed to create team.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromTeam = (participant: ParticipantWithProfile, teamName: string) => {
    Alert.alert(
      'Remove from team',
      `Remove ${participant.display_name || 'this user'} from ${teamName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromTeam(participant.id);
            } catch {
              Alert.alert('Error', 'Failed to remove from team.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteTeam = (team: Team) => {
    Alert.alert(
      'Delete team',
      `Delete "${team.name}"? Members will be unassigned.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTeam(team.id);
            } catch {
              Alert.alert('Error', 'Failed to delete team.');
            }
          },
        },
      ],
    );
  };

  const unassignedParticipants = participants.filter((p) => !p.team_id);

  const renderModalHeader = () => {
    if (modalView === 'createTeam') {
      return (
        <View className="px-4 pt-10 pb-4 border-b border-white/10 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setModalView('list')}
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Create Team</Text>
          </View>
          <TouchableOpacity
            onPress={handleCloseTeamsModal}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    if (modalView === 'addMember') {
      return (
        <View className="px-4 pt-10 pb-4 border-b border-white/10 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity
              onPress={() => { setModalView('list'); setTeamForAdd(null); }}
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Add Member</Text>
              {teamForAdd && (
                <Text className="text-white/60 text-xs mt-0.5">to {teamForAdd.name}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleCloseTeamsModal}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="px-4 pt-10 pb-4 border-b border-white/10 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">Teams & participants</Text>
        <TouchableOpacity
          onPress={handleCloseTeamsModal}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCreateTeamView = () => (
    <View className="flex-1 px-4 py-6">
      <Text className="text-white/60 text-xs mb-6">Set a name and color for this team.</Text>

      <View className="mb-6">
        <Text className="text-white/80 text-sm mb-2">Team name</Text>
        <TextInput
          value={newTeamName}
          onChangeText={setNewTeamName}
          placeholder="e.g. Team Thunder"
          placeholderTextColor="rgba(255,255,255,0.4)"
          className="rounded-xl border border-white/20 px-4 py-3 text-white bg-white/5 text-sm"
          autoFocus
        />
      </View>

      <View className="mb-8">
        <Text className="text-white/80 text-sm mb-3">Team color</Text>
        <View className="flex-row flex-wrap gap-3">
          {presetTeamColors.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setNewTeamColor(color)}
              className="rounded-2xl"
              style={{
                width: 54,
                height: 54,
                backgroundColor: color,
                borderColor: newTeamColor === color ? '#ffffff' : 'rgba(255,255,255,0.1)',
                borderWidth: newTeamColor === color ? 3 : 2,
              }}
              activeOpacity={0.85}
            >
              {newTeamColor === color && (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleCreateTeam}
        disabled={!newTeamName.trim() || isSaving}
        className="w-full rounded-xl py-3.5 items-center"
        style={{
          backgroundColor: newTeamName.trim() && !isSaving ? '#00c2ff' : 'rgba(255,255,255,0.1)',
        }}
        activeOpacity={newTeamName.trim() ? 0.85 : 1}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="black" />
        ) : (
          <Text
            className="text-sm font-bold"
            style={{ color: newTeamName.trim() ? '#000000' : 'rgba(255,255,255,0.4)' }}
          >
            Create team
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAddMemberView = () => (
    <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
      {unassignedParticipants.length > 0 ? (
        <View className="gap-2">
          {unassignedParticipants.map((participant) => (
            <TouchableOpacity
              key={participant.id}
              onPress={() => handleAddParticipantToTeam(participant.id)}
              disabled={isSaving}
              className="flex-row items-center justify-between px-3 py-3 rounded-xl bg-white/5 border border-white/10"
              activeOpacity={0.85}
            >
              <View className="flex-row items-center gap-3 flex-1">
                {participant.avatar_url ? (
                  <Image
                    source={{ uri: participant.avatar_url }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                    <Text className="text-white text-sm font-bold">{getInitial(participant.display_name)}</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                    {participant.display_name || 'User'}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Text className="text-white/70 text-xs">{participant.current_streak}</Text>
                    <Ionicons name="flame" size={10} color="#f97316" />
                    <Text className="text-white/60 text-xs">streak</Text>
                  </View>
                </View>
              </View>
              <Ionicons
                name="person-add-outline"
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="items-center justify-center py-16 px-6">
          <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.25)" />
          <Text className="text-white mt-4 font-semibold">No unassigned participants</Text>
          <Text className="text-white/60 text-xs mt-1 text-center">
            Everyone is already in a team.
          </Text>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  const renderListView = () => (
    <>
      {/* Section tabs */}
      <View className="flex-row px-4 pt-3 pb-2 border-b border-white/10 gap-2">
        {(['participants', 'teams'] as const).map((section) => {
          const isActive = activeSection === section;
          const label = section === 'participants' ? 'Participants' : 'Teams';
          const icon = section === 'participants' ? 'person-outline' : 'shield-outline';
          return (
            <TouchableOpacity
              key={section}
              onPress={() => setActiveSection(section)}
              className="flex-1 flex-row items-center justify-center rounded-full px-3 py-2 gap-2"
              style={{
                backgroundColor: isActive ? '#00c2ff' : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: isActive ? '#00c2ff' : 'rgba(255,255,255,0.15)',
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name={icon as any}
                size={16}
                color={isActive ? 'black' : 'rgba(255,255,255,0.7)'}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: isActive ? '#000000' : 'rgba(255,255,255,0.7)' }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00c2ff" />
        </View>
      ) : activeSection === 'participants' ? (
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {participants.length > 0 ? (
            <View className="gap-3">
              {participants.map((participant) => {
                const teamName = getTeamNameForParticipant(participant.team_id);
                return (
                  <View
                    key={participant.id}
                    className="flex-row items-center p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    {participant.avatar_url ? (
                      <Image
                        source={{ uri: participant.avatar_url }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                        <Text className="text-white font-bold text-lg">{getInitial(participant.display_name)}</Text>
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="text-white font-semibold">{participant.display_name || 'User'}</Text>
                      <Text className="text-white/50 text-xs" numberOfLines={1}>
                        {teamName ? `${teamName} • ` : ''}Joined {formatJoinDate(participant.joined_at)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveParticipant(participant)}
                      className="px-3 py-1.5 rounded-full border border-red-500/40"
                      activeOpacity={0.85}
                    >
                      <Text className="text-red-400 text-xs font-semibold">Remove</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-16 px-6">
              <Ionicons name="people" size={40} color="rgba(255,255,255,0.25)" />
              <Text className="text-white mt-4 font-semibold">No participants</Text>
              <Text className="text-white/60 text-xs mt-1 text-center">
                When people join this challenge, they&apos;ll appear here.
              </Text>
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {teams.length > 0 ? (
            <View className="mb-6">
              {teams.map((team) => {
                const teamMembers = participants.filter((p) => p.team_id === team.id);
                const memberCount = teamMembers.length;
                const isExpanded = expandedTeamId === team.id;

                return (
                  <View
                    key={team.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3"
                  >
                    <TouchableOpacity
                      onPress={() => setExpandedTeamId(isExpanded ? null : team.id)}
                      activeOpacity={0.85}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: team.color || '#666' }}
                          >
                            <Ionicons name="shield" size={20} color="black" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-bold">{team.name}</Text>
                            <Text className="text-white/60 text-xs">{memberCount} members</Text>
                          </View>
                        </View>
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => openAddMemberView(team)}
                            className="w-8 h-8 rounded-lg items-center justify-center bg-white/10"
                            activeOpacity={0.85}
                          >
                            <Ionicons name="add" size={18} color="#ffffff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteTeam(team)}
                            className="w-8 h-8 rounded-lg items-center justify-center bg-red-500/10"
                            activeOpacity={0.85}
                          >
                            <Ionicons name="trash-outline" size={16} color="#f97373" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {!isExpanded && (
                        <View className="flex-row mt-3 gap-1 items-center">
                          {teamMembers.slice(0, 3).map((member) =>
                            member.avatar_url ? (
                              <Image
                                key={member.id}
                                source={{ uri: member.avatar_url }}
                                style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                            ) : (
                              <View
                                key={member.id}
                                style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Text className="text-white text-xs font-bold">{getInitial(member.display_name)}</Text>
                              </View>
                            ),
                          )}
                          {memberCount > 3 && (
                            <Text className="text-white/40 text-xs ml-1">+{memberCount - 3}</Text>
                          )}
                          {memberCount === 0 && (
                            <Text className="text-white/30 text-xs">No members yet</Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>

                    {isExpanded && (
                      <View className="mt-3 pt-3 border-t border-white/10">
                        {teamMembers.length > 0 ? (
                          <View className="gap-2">
                            {teamMembers.map((member) => (
                              <View
                                key={member.id}
                                className="flex-row items-center py-2 px-1"
                              >
                                {member.avatar_url ? (
                                  <Image
                                    source={{ uri: member.avatar_url }}
                                    style={{ width: 36, height: 36, borderRadius: 18 }}
                                  />
                                ) : (
                                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text className="text-white font-bold text-sm">{getInitial(member.display_name)}</Text>
                                  </View>
                                )}
                                <View className="flex-1 ml-3">
                                  <Text className="text-white text-sm font-semibold">{member.display_name || 'User'}</Text>
                                  <View className="flex-row items-center gap-1 mt-0.5">
                                    <Text className="text-white/70 text-xs">{member.current_streak}</Text>
                                    <Ionicons name="flame" size={10} color="#f97316" />
                                    <Text className="text-white/40 text-xs">•</Text>
                                    <Text className="text-white/50 text-xs">{member.total_ability_points} AP</Text>
                                  </View>
                                </View>
                                <TouchableOpacity
                                  onPress={() => handleRemoveFromTeam(member, team.name)}
                                  className="px-2.5 py-1 rounded-full border border-white/15"
                                  activeOpacity={0.85}
                                >
                                  <Text className="text-white/60 text-xs font-medium">Remove</Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text className="text-white/30 text-xs text-center py-3">No members yet</Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-16 px-6">
              <Ionicons name="shield" size={40} color="rgba(255,255,255,0.25)" />
              <Text className="text-white mt-4 font-semibold">No teams yet</Text>
              <Text className="text-white/60 text-xs mt-1 text-center">
                Teams help you group participants into friendly competition.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={openCreateTeamView}
            className="flex-row items-center justify-center gap-2 rounded-xl py-3"
            style={{ backgroundColor: '#00c2ff' }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="black" />
            <Text className="text-black font-bold text-sm">Create team</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </>
  );

  return (
    <>
      <ScrollView className="flex-1 bg-black">
        <View className="p-6 pb-24">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#00c2ff20' }}
            >
              <Ionicons name="settings" size={20} color="#00c2ff" />
            </View>
            <View>
              <Text className="text-white text-lg font-bold">Admin controls</Text>
              <Text className="text-white/60 text-xs mt-1">Only visible to the challenge owner.</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleOpenTeamsModal}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons name="people" size={16} color="#00c2ff" />
              <Text className="text-white font-semibold text-sm">Teams & participants</Text>
            </View>
            <Text className="text-white/60 text-xs">
              Control who&apos;s in the challenge and how teams are set up.
            </Text>
          </TouchableOpacity>

          <View className="gap-3 mt-4">
            {/* <View className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-60">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="list" size={16} color="rgba(255,255,255,0.6)" />
                <Text className="text-white font-semibold text-sm">Manage tasks (Coming soon)</Text>
              </View>
              <Text className="text-white/60 text-xs">
                Add, edit, or remove tasks for this challenge.
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-60">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="megaphone" size={16} color="rgba(255,255,255,0.6)" />
                <Text className="text-white font-semibold text-sm">Announcements (Coming soon)</Text>
              </View>
              <Text className="text-white/60 text-xs">
                Post updates that show up for everyone in the challenge.
              </Text>
            </View> */}
          </View>
        </View>
      </ScrollView>

      {/* Teams & Participants Modal — single sheet with view switching */}
      <Modal
        visible={isTeamsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseTeamsModal}
      >
        <View className="flex-1 bg-black">
          {renderModalHeader()}

          {modalView === 'createTeam' && renderCreateTeamView()}
          {modalView === 'addMember' && renderAddMemberView()}
          {modalView === 'list' && renderListView()}
        </View>
      </Modal>
    </>
  );
}
