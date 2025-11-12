import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export interface GroupInfo {
  name: string;
  logo: string;
  color: string;
  description: string;
  members: number;
  challenges: number;
  founded: string;
  location: string;
  stats: {
    totalRuns: number;
    totalDistance: string;
    activeMembers: number;
  };
  recentMembers: Array<{
    name: string;
    avatar: string;
  }>;
}

interface GroupInfoModalProps {
  visible: boolean;
  onClose: () => void;
  group: GroupInfo | null;
}

export function GroupInfoModal({ visible, onClose, group }: GroupInfoModalProps) {
  if (!group) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-[#1a1a1a]">
        {/* Group Header with Colored Background */}
        <View className="rounded-b-2xl p-6" style={{ backgroundColor: group.color }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1" />
            <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-start gap-4">
            <View className="w-20 h-20 rounded-2xl bg-white items-center justify-center shadow-lg">
              <Text style={{ fontSize: 40 }}>{group.logo}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">{group.name}</Text>
              <View className="flex-row items-center gap-4 text-white/90 text-sm">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="people" size={16} color="rgba(255,255,255,0.9)" />
                  <Text className="text-white/90">{group.members} members</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.9)" />
                  <Text className="text-white/90">{group.challenges} challenges</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 space-y-6">
            {/* About Section */}
            <View>
              <Text className="text-white text-lg font-bold mb-2">About</Text>
              <Text className="text-white/60 text-sm leading-relaxed">{group.description}</Text>
            </View>

            {/* Info Grid */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="location" size={16} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white/60 text-sm">Location</Text>
                </View>
                <Text className="text-white font-medium">{group.location}</Text>
              </View>
              <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white/60 text-sm">Founded</Text>
                </View>
                <Text className="text-white font-medium">{group.founded}</Text>
              </View>
            </View>

            {/* Group Stats */}
            <View>
              <Text className="text-white text-lg font-bold mb-3">Group Stats</Text>
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-xl p-4 items-center" style={{ backgroundColor: '#00c2ff' }}>
                  <Text className="text-black text-2xl font-bold mb-1">
                    {group.stats.totalRuns}
                  </Text>
                  <Text className="text-black/80 text-xs">Total Runs</Text>
                </View>
                <View className="flex-1 rounded-xl p-4 items-center" style={{ backgroundColor: '#84cc16' }}>
                  <Text className="text-black text-2xl font-bold mb-1">
                    {group.stats.totalDistance}
                  </Text>
                  <Text className="text-black/80 text-xs">Distance</Text>
                </View>
                <View className="flex-1 rounded-xl p-4 items-center" style={{ backgroundColor: '#a855f7' }}>
                  <Text className="text-black text-2xl font-bold mb-1">
                    {group.stats.activeMembers}
                  </Text>
                  <Text className="text-black/80 text-xs">Active</Text>
                </View>
              </View>
            </View>

            {/* Recent Members */}
            <View>
              <Text className="text-white text-lg font-bold mb-3">Recent Members</Text>
              <View className="flex-row flex-wrap gap-3">
                {group.recentMembers.map((member, index) => (
                  <View key={index} className="items-center" style={{ width: 70 }}>
                    <View className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-white/10">
                      <Image
                        source={{ uri: member.avatar }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                    <Text className="text-white text-xs text-center" numberOfLines={2}>
                      {member.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
