import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface LeaderboardTabProps {
  challengeId: string;
}

interface User {
  rank: number;
  name: string;
  avatar: string;
  streak: number;
  points: number;
  isPerfect: boolean;
  teamId: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  totalPoints: number;
  totalStreak: number;
  members: number;
}

const mockLeaderboardData: User[] = [
  { rank: 1, name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', streak: 22, points: 310, isPerfect: true, teamId: 't2' },
  { rank: 2, name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', streak: 15, points: 245, isPerfect: false, teamId: 't2' },
  { rank: 3, name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', streak: 7, points: 95, isPerfect: false, teamId: 't1' },
  { rank: 4, name: 'Alex Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', streak: 12, points: 180, isPerfect: false, teamId: 't1' },
  { rank: 5, name: 'Jessica Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', streak: 18, points: 270, isPerfect: false, teamId: 't3' },
  { rank: 6, name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', streak: 0, points: 180, isPerfect: false, teamId: 't3' },
];

const mockTeamsData: Team[] = [
  { id: 't1', name: 'Team Thunder', color: '#00c2ff', totalPoints: 275, totalStreak: 19, members: 2 },
  { id: 't2', name: 'Team Phoenix', color: '#f97316', totalPoints: 555, totalStreak: 37, members: 2 },
  { id: 't3', name: 'Team Blaze', color: '#84cc16', totalPoints: 450, totalStreak: 18, members: 2 },
];

export function LeaderboardTab({ challengeId }: LeaderboardTabProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const topThree = mockLeaderboardData.slice(0, 3);
  const others = mockLeaderboardData.slice(3);
  const sortedTeamsByPoints = [...mockTeamsData].sort((a, b) => b.totalPoints - a.totalPoints);

  const selectedTeam = mockTeamsData.find(team => team.id === selectedTeamId);
  const teamMembers = mockLeaderboardData.filter(user => user.teamId === selectedTeamId);

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsModalOpen(true);
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 space-y-6 pb-24">
        {/* Team Standings */}
        <View className='mb-6'>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="shield" size={20} color="#00c2ff" />
            <Text className="text-white text-lg font-bold">Team Standings</Text>
          </View>

          <View className="space-y-2">
            {sortedTeamsByPoints.map((team, index) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => handleTeamClick(team.id)}
                className="bg-[#1a1a1a] rounded-xl p-4 mb-3 border-2 flex-row items-center justify-between"
                style={{ borderColor: team.color + '40' }}
              >
                <View className="flex-row items-center gap-3">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: team.color }}
                  >
                    <Text className="text-black font-bold">#{index + 1}</Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold">{team.name}</Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="people" size={12} color="rgba(255,255,255,0.6)" />
                        <Text className="text-white/60 text-xs">{team.members} members</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center gap-4">
                    <View className="items-end">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="flame" size={16} color="#f97316" />
                        <Text className="text-white font-bold">{team.totalStreak}</Text>
                      </View>
                      <Text className="text-white/60 text-xs">Streak</Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="trophy" size={16} color="#00c2ff" />
                        <Text className="text-white font-bold">{team.totalPoints}</Text>
                      </View>
                      <Text className="text-white/60 text-xs">Points</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Individual Leaderboard */}
        <View className='mb-6'>
          <Text className="text-white text-lg font-bold mb-4">Individual Leaderboard</Text>

          {/* Top 3 Podium */}
          <View className="flex-row items-end justify-center gap-2 mb-6">
            {/* 2nd Place */}
            <View className="flex-1 items-center">
              <View className="bg-white/10 px-3 py-1 rounded-full mb-2">
                <Text className="text-white text-xs font-bold">#2</Text>
              </View>
              <Image
                source={{ uri: topThree[1].avatar }}
                style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' }}
              />
              <View className="mt-2 bg-[#2a2a2a] rounded-t-xl p-3 w-full items-center border border-white/20" style={{ height: 96 }}>
                <Text className="text-white/60 text-xs mb-1">{topThree[1].name.split(' ')[0]}</Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="flame" size={12} color="#f97316" />
                  <Text className="text-white text-xs">{topThree[1].streak}</Text>
                </View>
                <Text className="text-white/60 text-xs mt-1">{topThree[1].points} AP</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View className="flex-1 items-center">
              <View className="px-3 py-1 rounded-full mb-2 flex-row items-center" style={{ backgroundColor: '#00c2ff' }}>
                <Ionicons name="trophy" size={12} color="black" />
                <Text className="text-black text-xs font-bold ml-1">#1</Text>
              </View>
              <Image
                source={{ uri: topThree[0].avatar }}
                style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#00c2ff' }}
              />
              <View className="mt-2 rounded-t-xl p-3 w-full items-center border" style={{ height: 128, backgroundColor: '#00c2ff20', borderColor: '#00c2ff40' }}>
                <Text className="text-white/60 text-xs mb-1">{topThree[0].name.split(' ')[0]}</Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="flame" size={16} color="#f97316" />
                  <Text className="text-white font-bold">{topThree[0].streak}</Text>
                </View>
                <Text className="text-white/60 text-xs mt-1">{topThree[0].points} AP</Text>
                {topThree[0].isPerfect && (
                  <View className="bg-white/10 px-2 py-1 rounded-full mt-2">
                    <Text className="text-white text-xs">Perfect! 🎯</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 3rd Place */}
            <View className="flex-1 items-center">
              <View className="px-3 py-1 rounded-full mb-2" style={{ backgroundColor: '#f9731620' }}>
                <Text className="text-xs font-bold" style={{ color: '#f97316' }}>#3</Text>
              </View>
              <Image
                source={{ uri: topThree[2].avatar }}
                style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#f9731620' }}
              />
              <View className="mt-2 rounded-t-xl p-3 w-full items-center border" style={{ height: 80, backgroundColor: '#f9731620', borderColor: '#f9731620' }}>
                <Text className="text-white/60 text-xs mb-1">{topThree[2].name.split(' ')[0]}</Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="flame" size={12} color="#f97316" />
                  <Text className="text-white text-xs">{topThree[2].streak}</Text>
                </View>
                <Text className="text-white/60 text-xs mt-1">{topThree[2].points} AP</Text>
              </View>
            </View>
          </View>

          {/* Other Rankings */}
          <View className="space-y-2">
            {others.map((user) => (
              <View
                key={user.rank}
                className="bg-[#1a1a1a] rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-white/40 w-8 text-center">#{user.rank}</Text>
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                  <View>
                    <Text className="text-white">{user.name}</Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="flame" size={12} color="#f97316" />
                        <Text className="text-white/60 text-xs">{user.streak} days</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="trophy" size={12} color="#00c2ff" />
                        <Text className="text-white/60 text-xs">{user.points} AP</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {user.isPerfect && (
                  <View className="px-2 py-1 rounded-full" style={{ backgroundColor: '#10b98120' }}>
                    <Text className="text-xs" style={{ color: '#10b981' }}>Perfect</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
                    style={{ backgroundColor: selectedTeam.color }}
                  >
                    <Ionicons name="shield" size={32} color="black" />
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold">{selectedTeam.name}</Text>
                    <View className="flex-row items-center gap-4 mt-2">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="people" size={16} color="rgba(255,255,255,0.6)" />
                        <Text className="text-white/60 text-sm">{selectedTeam.members} members</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="flame" size={16} color="#f97316" />
                        <Text className="text-white/60 text-sm">{selectedTeam.totalStreak} streak</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="trophy" size={16} color="#00c2ff" />
                        <Text className="text-white/60 text-sm">{selectedTeam.totalPoints} points</Text>
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
                        key={member.rank}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center gap-4">
                          <Image
                            source={{ uri: member.avatar }}
                            style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: selectedTeam.color }}
                          />
                          <View>
                            <Text className="text-white font-bold">{member.name}</Text>
                            <Text className="text-white/60 text-xs mt-1">Rank #{member.rank} Overall</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-4">
                          <View className="items-end">
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="flame" size={16} color="#f97316" />
                              <Text className="text-white">{member.streak}</Text>
                            </View>
                            <Text className="text-white/60 text-xs">Streak</Text>
                          </View>
                          <View className="items-end">
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="trophy" size={16} color="#00c2ff" />
                              <Text className="text-white">{member.points}</Text>
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
