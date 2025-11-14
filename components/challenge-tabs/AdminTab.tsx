import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface AdminTabProps {
  challengeId: string;
}

interface AdminParticipant {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  team?: string | null;
  joinedAt: string;
}

interface AdminTeam {
  id: string;
  name: string;
  color: string;
}

const mockAdminParticipants: AdminParticipant[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    streak: 15,
    team: 'Team Thunder',
    joinedAt: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    streak: 8,
    team: 'Team Phoenix',
    joinedAt: '10 days ago',
  },
  {
    id: '3',
    name: 'Emma Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    streak: 22,
    team: 'Team Blaze',
    joinedAt: '1 week ago',
  },
  {
    id: '4',
    name: 'David Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    streak: 12,
    team: null,
    joinedAt: '5 days ago',
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    streak: 5,
    team: null,
    joinedAt: '3 days ago',
  },
];

const mockAdminTeams: AdminTeam[] = [
  { id: 't1', name: 'Team Thunder', color: '#00c2ff' },
  { id: 't2', name: 'Team Phoenix', color: '#f97316' },
  { id: 't3', name: 'Team Blaze', color: '#a855f7' },
];

export function AdminTab({ challengeId }: AdminTabProps) {
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'participants' | 'teams'>('participants');
  const [participants, setParticipants] = useState<AdminParticipant[]>(mockAdminParticipants);
  const [teams, setTeams] = useState<AdminTeam[]>(mockAdminTeams);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [teamForAdd, setTeamForAdd] = useState<AdminTeam | null>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const presetTeamColors = [
    '#00c2ff', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#a855f7', // Purple
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#eab308', // Yellow
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Emerald
  ];
  const [newTeamColor, setNewTeamColor] = useState<string>(presetTeamColors[0]);

  const handleOpenTeamsModal = () => {
    setActiveSection('participants');
    setIsTeamsModalOpen(true);
  };

  const handleCloseTeamsModal = () => {
    setIsTeamsModalOpen(false);
  };

  const handleRemoveParticipant = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;

    Alert.alert(
      'Remove participant',
      `Remove ${participant.name} from this challenge?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setParticipants((prev) => prev.filter((p) => p.id !== participantId));
          },
        },
      ],
    );
  };

  const openAddMemberModal = (team: AdminTeam) => {
    setTeamForAdd(team);
    setIsAddMemberModalOpen(true);
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
    setTeamForAdd(null);
  };

  const handleAddParticipantToTeam = (participantId: string) => {
    if (!teamForAdd) return;

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              team: teamForAdd.name,
            }
          : p,
      ),
    );

    setIsAddMemberModalOpen(false);
  };

  const openCreateTeamModal = () => {
    setNewTeamName('');
    setNewTeamColor(presetTeamColors[0]);
    setIsCreateTeamModalOpen(true);
  };

  const closeCreateTeamModal = () => {
    setIsCreateTeamModalOpen(false);
  };

  const handleCreateTeam = () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName) {
      Alert.alert('Team name required', 'Please enter a name for the team.');
      return;
    }

    const newTeam: AdminTeam = {
      id: `t-${Date.now().toString()}`,
      name: trimmedName,
      color: newTeamColor,
    };

    setTeams((prev) => [...prev, newTeam]);
    setIsCreateTeamModalOpen(false);
  };

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

          <View className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <Text className="text-white font-semibold mb-1">Coming soon</Text>
            <Text className="text-white/60 text-sm">
              You&apos;ll be able to manage tasks, teams, and participants for this challenge from here.
            </Text>
          </View>

          <View className="gap-3 mt-4">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-60">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="list" size={16} color="rgba(255,255,255,0.6)" />
                <Text className="text-white font-semibold text-sm">Manage tasks</Text>
              </View>
              <Text className="text-white/60 text-xs">
                Add, edit, or remove tasks for this challenge.
              </Text>
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

            <View className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-60">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="megaphone" size={16} color="rgba(255,255,255,0.6)" />
                <Text className="text-white font-semibold text-sm">Announcements</Text>
              </View>
              <Text className="text-white/60 text-xs">
                Post updates that show up for everyone in the challenge.
              </Text>
            </View>
          </View>

          <View className="mt-8 items-start">
            <TouchableOpacity
              disabled
              className="px-4 py-3 rounded-xl border border-dashed border-white/30 bg-white/5 opacity-60"
            >
              <Text className="text-white/70 text-sm font-medium">
                Configure admin tools (coming soon)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Teams & Participants Modal */}
      <Modal
        visible={isTeamsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseTeamsModal}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
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

          {activeSection === 'participants' ? (
            <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
              {participants.length > 0 ? (
                <View className="gap-3">
                  {participants.map((participant) => (
                    <View
                      key={participant.id}
                      className="flex-row items-center p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <Image
                        source={{ uri: participant.avatar }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-semibold">{participant.name}</Text>
                        <Text className="text-white/50 text-xs" numberOfLines={1}>
                          {participant.team ? `${participant.team} • ` : ''}Joined {participant.joinedAt}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveParticipant(participant.id)}
                        className="px-3 py-1.5 rounded-full border border-red-500/40"
                        activeOpacity={0.85}
                      >
                        <Text className="text-red-400 text-xs font-semibold">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
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
                    const memberCount = participants.filter((p) => p.team === team.name).length;

                    return (
                      <View
                        key={team.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center gap-3">
                            <View
                              className="w-10 h-10 rounded-full items-center justify-center"
                              style={{ backgroundColor: team.color }}
                            >
                              <Ionicons name="shield" size={20} color="black" />
                            </View>
                            <View>
                              <Text className="text-white font-bold">{team.name}</Text>
                              <Text className="text-white/60 text-xs">{memberCount} members</Text>
                            </View>
                          </View>
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => openAddMemberModal(team)}
                              className="w-8 h-8 rounded-lg items-center justify-center bg-white/10"
                              activeOpacity={0.85}
                            >
                              <Ionicons name="add" size={18} color="#ffffff" />
                            </TouchableOpacity>
                            <View className="w-8 h-8 rounded-lg items-center justify-center bg-red-500/10 opacity-60">
                              <Ionicons name="trash-outline" size={16} color="#f97373" />
                            </View>
                          </View>
                        </View>

                        <View className="flex-row mt-2 gap-1">
                          {[0, 1, 2].map((index) => (
                            <View
                              key={index}
                              className="w-8 h-8 rounded-full border border-white/10"
                              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                            />
                          ))}
                        </View>
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
                onPress={openCreateTeamModal}
                className="flex-row items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl"
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={22} color="#00c2ff" />
                <Text className="text-white font-medium text-sm">Create team</Text>
              </TouchableOpacity>

              <View style={{ height: 80 }} />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Add Member to Team Modal */}
      <Modal
        visible={isAddMemberModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeAddMemberModal}
      >
        <View
          className="flex-1 items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <View className="w-full rounded-2xl bg-[#111827] border border-white/10 p-4 max-w-xs">
            <Text className="text-white text-base font-semibold mb-1">Add Member to Team</Text>
            <Text className="text-white/60 text-xs mb-3">
              {teamForAdd
                ? `Select a participant to add to ${teamForAdd.name}`
                : 'Select a participant to add to this team.'}
            </Text>

            <ScrollView className="max-h-80 mt-1" showsVerticalScrollIndicator={false}>
              {participants.filter((p) => !p.team).length > 0 ? (
                <View className="gap-2">
                  {participants
                    .filter((p) => !p.team)
                    .map((participant) => (
                      <TouchableOpacity
                        key={participant.id}
                        onPress={() => handleAddParticipantToTeam(participant.id)}
                        className="flex-row items-center justify-between px-3 py-2.5 rounded-xl bg-[#020617] border border-white/10"
                        activeOpacity={0.85}
                      >
                        <View className="flex-row items-center gap-3 flex-1">
                          <Image
                            source={{ uri: participant.avatar }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                          />
                          <View className="flex-1">
                            <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                              {participant.name}
                            </Text>
                            <View className="flex-row items-center gap-1 mt-0.5">
                              <Text className="text-white/70 text-xs">{participant.streak}</Text>
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
                <View className="items-center justify-center py-8 px-4">
                  <Ionicons name="people-outline" size={32} color="rgba(255,255,255,0.3)" />
                  <Text className="text-white/70 text-xs mt-3 text-center">
                    Everyone is already in a team.
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={closeAddMemberModal}
              className="mt-4 w-full rounded-xl border border-white/20 py-2.5 items-center"
              activeOpacity={0.85}
            >
              <Text className="text-white/90 text-sm font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        visible={isCreateTeamModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCreateTeamModal}
      >
        <View
          className="flex-1 items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <View className="w-full rounded-2xl bg-[#111827] border border-white/10 p-4 max-w-xs">
            <Text className="text-white text-base font-semibold mb-1">Create Team</Text>
            <Text className="text-white/60 text-xs mb-3">
              Set a name and color for this team.
            </Text>

            <View className="mb-4">
              <Text className="text-white/80 text-xs mb-1">Team name</Text>
              <TextInput
                value={newTeamName}
                onChangeText={setNewTeamName}
                placeholder="e.g. Team Thunder"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="rounded-xl border border-white/20 px-3 py-2 text-white bg-[#020617] text-sm"
              />
            </View>

            <View className="mb-3">
              <Text className="text-white/80 text-xs mb-2">Team color</Text>
              <View className="flex-row flex-wrap gap-3">
                {presetTeamColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setNewTeamColor(color)}
                    className="rounded-2xl border-2"
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: color,
                      borderColor: newTeamColor === color ? '#ffffff' : 'rgba(255,255,255,0.1)',
                      borderWidth: newTeamColor === color ? 3 : 2,
                    }}
                    activeOpacity={0.85}
                  >
                    {newTeamColor === color && (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="checkmark" size={22} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateTeam}
              disabled={!newTeamName.trim()}
              className="mt-3 w-full rounded-xl py-2.5 items-center"
              style={{
                backgroundColor: newTeamName.trim() ? '#00c2ff' : 'rgba(255,255,255,0.1)',
              }}
              activeOpacity={newTeamName.trim() ? 0.85 : 1}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: newTeamName.trim() ? '#000000' : 'rgba(255,255,255,0.4)' }}
              >
                Create team
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeCreateTeamModal}
              className="mt-3 w-full rounded-xl border border-white/20 py-2.5 items-center"
              activeOpacity={0.85}
            >
              <Text className="text-white/90 text-sm font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
