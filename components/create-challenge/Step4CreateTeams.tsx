import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';

interface Team {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
}

interface Step4CreateTeamsProps {
  data: {
    teams: Team[];
    selectedUsers: string[];
  };
  onUpdate: (updates: Partial<Step4CreateTeamsProps['data']>) => void;
}

// Brand colors matching profile screen
const TEAM_COLORS = [
  { name: 'Cyan', value: '#00c2ff' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
];

const mockUsers = [
  { id: '1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '2', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  { id: '3', name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  { id: '4', name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: '5', name: 'Jessica Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' },
];

export function Step4CreateTeams({ data, onUpdate }: Step4CreateTeamsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#00c2ff');

  // Get users who were selected in Step 3
  const availableUsers = mockUsers.filter(u => data.selectedUsers.includes(u.id));
  const assignedUserIds = data.teams.flatMap(t => t.memberIds);
  const unassignedUsers = availableUsers.filter(u => !assignedUserIds.includes(u.id));

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const createTeam = () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      color: newTeamColor,
      memberIds: [],
    };

    onUpdate({ teams: [...data.teams, newTeam] });
    setNewTeamName('');
    setNewTeamColor('#00c2ff');
    setShowCreateModal(false);
  };

  const deleteTeam = (teamId: string) => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onUpdate({ teams: data.teams.filter(t => t.id !== teamId) }),
        },
      ]
    );
  };

  const assignUserToTeam = (userId: string) => {
    if (!selectedTeamId) return;

    const updatedTeams = data.teams.map(team => {
      if (team.id === selectedTeamId) {
        return { ...team, memberIds: [...team.memberIds, userId] };
      }
      return team;
    });

    onUpdate({ teams: updatedTeams });
  };

  const removeUserFromTeam = (teamId: string, userId: string) => {
    const updatedTeams = data.teams.map(team => {
      if (team.id === teamId) {
        return { ...team, memberIds: team.memberIds.filter(id => id !== userId) };
      }
      return team;
    });

    onUpdate({ teams: updatedTeams });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 py-6 border-b border-white/10">
        <Text className="text-white text-xl font-bold mb-2">Create Teams</Text>
        <Text className="text-white/60 text-sm">
          Organize participants into competing teams
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Teams List */}
        {data.teams.length > 0 ? (
          <View className="mb-6">
            {data.teams.map((team, teamIndex) => {
              const teamMembers = availableUsers.filter(u => team.memberIds.includes(u.id));
              
              return (
                <View key={team.id} className="bg-white/5 border border-white/10 rounded-xl p-4" style={{ marginBottom: teamIndex < data.teams.length - 1 ? 16 : 0 }}>
                  {/* Team Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: team.color }}
                      >
                        <Ionicons name="shield" size={20} color="black" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold">{team.name}</Text>
                        <Text className="text-white/60 text-xs">
                          {team.memberIds.length} {team.memberIds.length === 1 ? 'member' : 'members'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedTeamId(team.id);
                          setShowAssignModal(true);
                        }}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: hexToRgba(team.color, 0.2), marginRight: 8 }}
                      >
                        <Ionicons name="add" size={20} color={team.color} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteTeam(team.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 items-center justify-center"
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Team Members */}
                  {teamMembers.length > 0 ? (
                    <View>
                      {teamMembers.map((user, userIndex) => (
                        <View
                          key={user.id}
                          className="flex-row items-center justify-between p-2 rounded-lg"
                          style={{ 
                            backgroundColor: hexToRgba(team.color, 0.1),
                            marginBottom: userIndex < teamMembers.length - 1 ? 8 : 0
                          }}
                        >
                          <View className="flex-row items-center gap-2">
                            <Image
                              source={{ uri: user.avatar }}
                              style={{ width: 32, height: 32, borderRadius: 16 }}
                            />
                            <Text className="text-white text-sm">{user.name}</Text>
                          </View>
                          <TouchableOpacity onPress={() => removeUserFromTeam(team.id, user.id)}>
                            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="items-center py-4">
                      <Text className="text-white/40 text-sm">No members yet</Text>
                      <Text className="text-white/40 text-xs">Tap + to add members</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          // Empty State
          <View className="items-center justify-center py-12 mb-6">
            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
              <Ionicons name="shield" size={40} color="rgba(255,255,255,0.4)" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">No Teams Yet</Text>
            <Text className="text-white/60 text-center px-8">
              Create teams to organize participants
            </Text>
          </View>
        )}

        {/* Create Team Button */}
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="flex-row items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl mb-6"
        >
          <Ionicons name="add-circle-outline" size={24} color="rgba(255,255,255,0.6)" />
          <Text className="text-white/60 font-medium">Create Team</Text>
        </TouchableOpacity>

        {/* Unassigned Users */}
        {unassignedUsers.length > 0 && (
          <View>
            <Text className="text-white font-bold mb-3">Unassigned Participants ({unassignedUsers.length})</Text>
            <View>
              {unassignedUsers.map((user, userIndex) => (
                <View
                  key={user.id}
                  className="flex-row items-center p-3 rounded-xl bg-white/5 border border-white/10"
                  style={{ marginBottom: userIndex < unassignedUsers.length - 1 ? 8 : 0 }}
                >
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                  <Text className="text-white ml-3 flex-1">{user.name}</Text>
                  <Ionicons name="alert-circle" size={20} color="#f97316" />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-[#1a1a1a]">
          <View className="p-6 border-b border-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-xl font-bold">Create Team</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="mb-6">
              <Text className="text-white mb-2 font-medium">Team Name *</Text>
              <TextInput
                value={newTeamName}
                onChangeText={setNewTeamName}
                placeholder="e.g., Team Thunder"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="bg-black border border-white/20 rounded-xl px-4 py-3 text-white"
              />
            </View>

            <View className="mb-6">
              <Text className="text-white mb-3 font-medium">Team Color</Text>
              <View className="flex-row flex-wrap">
                {TEAM_COLORS.map((color) => {
                  const isSelected = newTeamColor === color.value;
                  return (
                    <TouchableOpacity
                      key={color.value}
                      onPress={() => setNewTeamColor(color.value)}
                      className="items-center mr-3 mb-3"
                    >
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: color.value,
                          borderWidth: 2,
                          borderColor: isSelected ? '#ffffff' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={24} color="black" />
                        )}
                      </View>
                      <Text className="text-white/60 text-xs mt-1">{color.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View className="p-6 border-t border-white/10">
            <TouchableOpacity
              onPress={createTeam}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Text className="text-black font-bold text-lg">Create Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign Users Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View className="flex-1 bg-[#1a1a1a]">
          <View className="p-6 border-b border-white/10">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold">Assign Members</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {unassignedUsers.length > 0 ? (
              <View>
                {unassignedUsers.map((user, userIndex) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => {
                      assignUserToTeam(user.id);
                      if (unassignedUsers.length === 1) {
                        setShowAssignModal(false);
                      }
                    }}
                    className="flex-row items-center p-4 rounded-xl bg-white/5 border border-white/10"
                    style={{ marginBottom: userIndex < unassignedUsers.length - 1 ? 8 : 0 }}
                  >
                    <Image
                      source={{ uri: user.avatar }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                    <Text className="text-white ml-3 flex-1">{user.name}</Text>
                    <Ionicons name="add-circle" size={24} color="#00c2ff" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-white/60">All participants are assigned</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
