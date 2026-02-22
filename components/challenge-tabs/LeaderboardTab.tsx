import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/types/database.example';

interface LeaderboardTabProps {
  challengeId: string;
}

export function LeaderboardTab({ challengeId }: LeaderboardTabProps) {
  const { individuals, teams, loading, error, refetch } = useLeaderboard(challengeId);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const topThree = individuals.slice(0, 3);
  const others = individuals.slice(3, 6);
  const hasTeams = teams.length > 0;

  const selectedTeam = teams.find((t) => t.team_id === selectedTeamId);
  const teamMembers = individuals.filter(
    (u) => u.team_id && selectedTeam && u.team_id === selectedTeam.team_id,
  );

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsModalOpen(true);
  };

  const getInitial = (name: string | null) => (name ? name.charAt(0).toUpperCase() : '?');

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center py-20">
        <ActivityIndicator size="large" color="#00c2ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center py-20 px-6">
        <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.4)" />
        <Text className="text-white/60 mt-4 mb-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={refetch}
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: '#00c2ff' }}
        >
          <Text className="text-black font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (individuals.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center py-20 px-6">
        <Ionicons name="trophy-outline" size={48} color="rgba(255,255,255,0.2)" />
        <Text className="text-white/60 mt-4 text-center">No participants yet</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 space-y-6 pb-24">
        {/* Team Standings */}
        {hasTeams && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="shield" size={20} color="#00c2ff" />
              <Text className="text-white text-lg font-bold">Team Standings</Text>
            </View>

            <View className="space-y-2">
              {teams.map((team, index) => (
                <TouchableOpacity
                  key={team.team_id}
                  onPress={() => handleTeamClick(team.team_id)}
                  className="bg-[#1a1a1a] rounded-xl p-4 mb-3 border-2 flex-row items-center justify-between"
                  style={{ borderColor: (team.team_color || '#666') + '40' }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: team.team_color || '#666' }}
                    >
                      <Text className="text-black font-bold">#{index + 1}</Text>
                    </View>
                    <View>
                      <Text className="text-white font-bold">{team.team_name}</Text>
                      <View className="flex-row items-center gap-3 mt-1">
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="people" size={12} color="rgba(255,255,255,0.6)" />
                          <Text className="text-white/60 text-xs">{team.member_count} members</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center gap-4">
                      <View className="items-end">
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="flame" size={16} color="#f97316" />
                          <Text className="text-white font-bold">{team.total_streak}</Text>
                        </View>
                        <Text className="text-white/60 text-xs">Streak</Text>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="trophy" size={16} color="#00c2ff" />
                          <Text className="text-white font-bold">{team.total_points}</Text>
                        </View>
                        <Text className="text-white/60 text-xs">Points</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Individual Leaderboard */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Individual Leaderboard</Text>

          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <View className="flex-row items-end justify-center gap-2 mb-6">
              {/* 2nd Place */}
              <View className="flex-1 items-center">
                <View className="bg-white/10 px-3 py-1 rounded-full mb-2">
                  <Text className="text-white text-xs font-bold">#2</Text>
                </View>
                {topThree[1].avatar_url ? (
                  <Image
                    source={{ uri: topThree[1].avatar_url }}
                    style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' }}
                  />
                ) : (
                  <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                    <Text className="text-white text-xl font-bold">{getInitial(topThree[1].display_name)}</Text>
                  </View>
                )}
                <View className="mt-2 bg-[#2a2a2a] rounded-t-xl p-3 w-full items-center border border-white/20" style={{ height: 96 }}>
                  <Text className="text-white/60 text-xs mb-1" numberOfLines={1}>{topThree[1].display_name || 'User'}</Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="flame" size={12} color="#f97316" />
                    <Text className="text-white text-xs">{topThree[1].current_streak}</Text>
                  </View>
                  <Text className="text-white/60 text-xs mt-1">{topThree[1].total_ability_points} AP</Text>
                </View>
              </View>

              {/* 1st Place */}
              <View className="flex-1 items-center">
                <View className="px-3 py-1 rounded-full mb-2 flex-row items-center" style={{ backgroundColor: '#00c2ff' }}>
                  <Ionicons name="trophy" size={12} color="black" />
                  <Text className="text-black text-xs font-bold ml-1">#1</Text>
                </View>
                {topThree[0].avatar_url ? (
                  <Image
                    source={{ uri: topThree[0].avatar_url }}
                    style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#00c2ff' }}
                  />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#00c2ff', backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                    <Text className="text-white text-2xl font-bold">{getInitial(topThree[0].display_name)}</Text>
                  </View>
                )}
                <View className="mt-2 rounded-t-xl p-3 w-full items-center border" style={{ height: 128, backgroundColor: '#00c2ff20', borderColor: '#00c2ff40' }}>
                  <Text className="text-white/60 text-xs mb-1" numberOfLines={1}>{topThree[0].display_name || 'User'}</Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="flame" size={16} color="#f97316" />
                    <Text className="text-white font-bold">{topThree[0].current_streak}</Text>
                  </View>
                  <Text className="text-white/60 text-xs mt-1">{topThree[0].total_ability_points} AP</Text>
                </View>
              </View>

              {/* 3rd Place */}
              <View className="flex-1 items-center">
                <View className="px-3 py-1 rounded-full mb-2" style={{ backgroundColor: '#f9731620' }}>
                  <Text className="text-xs font-bold" style={{ color: '#f97316' }}>#3</Text>
                </View>
                {topThree[2].avatar_url ? (
                  <Image
                    source={{ uri: topThree[2].avatar_url }}
                    style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#f9731620' }}
                  />
                ) : (
                  <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#f9731620', backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                    <Text className="text-white text-xl font-bold">{getInitial(topThree[2].display_name)}</Text>
                  </View>
                )}
                <View className="mt-2 rounded-t-xl p-3 w-full items-center border" style={{ height: 80, backgroundColor: '#f9731620', borderColor: '#f9731620' }}>
                  <Text className="text-white/60 text-xs mb-1" numberOfLines={1}>{topThree[2].display_name || 'User'}</Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="flame" size={12} color="#f97316" />
                    <Text className="text-white text-xs">{topThree[2].current_streak}</Text>
                  </View>
                  <Text className="text-white/60 text-xs mt-1">{topThree[2].total_ability_points} AP</Text>
                </View>
              </View>
            </View>
          )}

          {/* Fewer than 3 participants — show as list */}
          {topThree.length > 0 && topThree.length < 3 && (
            <View className="space-y-2 mb-4">
              {topThree.map((user) => (
                <RankRow key={user.id} user={user} getInitial={getInitial} />
              ))}
            </View>
          )}

          {/* Other Rankings (4th, 5th, 6th) */}
          {others.length > 0 && (
            <View className="space-y-2">
              {others.map((user) => (
                <RankRow key={user.id} user={user} getInitial={getInitial} />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Team Details Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-[#1a1a1a]">
          {selectedTeam && (
            <>
              {/* Modal Header */}
              <View className="p-4 border-b border-white/10">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-xl font-bold">Team Details</Text>
                  <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                    <Ionicons name="close" size={28} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-4">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{ backgroundColor: selectedTeam.team_color || '#666' }}
                  >
                    <Ionicons name="shield" size={32} color="black" />
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold">{selectedTeam.team_name}</Text>
                    <View className="flex-row items-center gap-4 mt-2">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="people" size={16} color="rgba(255,255,255,0.6)" />
                        <Text className="text-white/60 text-sm">{selectedTeam.member_count} members</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="flame" size={16} color="#f97316" />
                        <Text className="text-white/60 text-sm">{selectedTeam.total_streak} streak</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="trophy" size={16} color="#00c2ff" />
                        <Text className="text-white/60 text-sm">{selectedTeam.total_points} points</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Team Members */}
              <ScrollView className="flex-1 p-4">
                <Text className="text-white text-lg font-bold mb-4">Team Members</Text>
                {teamMembers.length > 0 ? (
                  <View className="space-y-3">
                    {teamMembers.map((member) => (
                      <View
                        key={member.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center gap-4">
                          {member.avatar_url ? (
                            <Image
                              source={{ uri: member.avatar_url }}
                              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: selectedTeam.team_color || '#666' }}
                            />
                          ) : (
                            <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: selectedTeam.team_color || '#666', backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
                              <Text className="text-white text-lg font-bold">{getInitial(member.display_name)}</Text>
                            </View>
                          )}
                          <View>
                            <Text className="text-white font-bold">{member.display_name || 'User'}</Text>
                            <Text className="text-white/60 text-xs mt-1">Rank #{member.rank} Overall</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-4">
                          <View className="items-end">
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="flame" size={16} color="#f97316" />
                              <Text className="text-white">{member.current_streak}</Text>
                            </View>
                            <Text className="text-white/60 text-xs">Streak</Text>
                          </View>
                          <View className="items-end">
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="trophy" size={16} color="#00c2ff" />
                              <Text className="text-white">{member.total_ability_points}</Text>
                            </View>
                            <Text className="text-white/60 text-xs">Points</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-12">
                    <Ionicons name="people" size={48} color="rgba(255,255,255,0.2)" />
                    <Text className="text-white/40 mt-3">No members in this team</Text>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

function RankRow({ user, getInitial }: { user: LeaderboardEntry; getInitial: (name: string | null) => string }) {
  return (
    <View className="bg-[#1a1a1a] rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Text className="text-white/40 w-8 text-center">#{user.rank}</Text>
        {user.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-white font-bold">{getInitial(user.display_name)}</Text>
          </View>
        )}
        <View>
          <Text className="text-white">{user.display_name || 'User'}</Text>
          <View className="flex-row items-center gap-3 mt-1">
            <View className="flex-row items-center gap-1">
              <Ionicons name="flame" size={12} color="#f97316" />
              <Text className="text-white/60 text-xs">{user.current_streak} days</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="trophy" size={12} color="#00c2ff" />
              <Text className="text-white/60 text-xs">{user.total_ability_points} AP</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
