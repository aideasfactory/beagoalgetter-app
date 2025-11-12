import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  NotificationsModal,
  Notification,
  ChallengePreviewModal,
  ChallengePreview,
  GivePointsModal,
  GroupInfoModal,
  GroupInfo,
} from '@/components';
import type { Post } from '@/components/PostCard';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    user: { name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    message: 'liked your post',
    post: 'Completed Day 15! Morning run + strength training ✓',
    timestamp: '5 minutes ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'points',
    user: { name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    message: 'gave you 10 ability points',
    post: 'Week 1 done! Consistency is key 💪',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'challenge',
    message: 'New challenge starting tomorrow: 30-Day Fitness Challenge',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'streak',
    message: '🔥 You\'re on a 15-day streak! Keep it up!',
    timestamp: '1 day ago',
    read: true,
  },
];

const mockChallenge: ChallengePreview = {
  id: 'c1',
  name: '30-Day Fitness Challenge',
  type: 'Group',
  members: 12,
  duration: '30 Days',
  completionPercentage: 45,
};

const mockPost: Post = {
  id: '1',
  user: {
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    streak: 15,
    abilityPoints: 245,
  },
  challenge: {
    id: 'c1',
    name: '30-Day Fitness Challenge',
    type: 'Group',
    members: 12,
  },
  type: 'success',
  message: 'Completed Day 15! Morning run + strength training ✓',
  timestamp: '2 hours ago',
  likes: 23,
  abilityPointsGiven: 5,
};

const mockGroup: GroupInfo = {
  name: 'Boro Runners',
  logo: '🏃',
  color: '#991b1b',
  description:
    'A community of passionate runners from Middlesbrough committed to staying active, supporting each other, and crushing fitness goals together. Whether you\'re training for your first 5K or your tenth marathon, we\'re here to motivate and inspire!',
  members: 247,
  challenges: 12,
  founded: 'January 2024',
  location: 'Middlesbrough, UK',
  stats: {
    totalRuns: 1842,
    totalDistance: '12,438 km',
    activeMembers: 189,
  },
  recentMembers: [
    { name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    { name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  ],
};

export default function ModalsTestScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showGivePoints, setShowGivePoints] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  const handleViewChallenge = () => {
    setShowChallenge(false);
    console.log('Navigate to challenge details');
  };

  const handleConfirmPoints = (points: number) => {
    console.log(`Confirmed ${points} points`);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Modals Test</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6 space-y-4">
          <Text className="text-white/60 text-sm mb-4">
            Test all 4 modal components for the Home feed
          </Text>

          {/* Modal Buttons */}
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="notifications" size={20} color="#00c2ff" />
              </View>
              <View>
                <Text className="text-white font-bold">Notifications Modal</Text>
                <Text className="text-white/60 text-sm">4 notifications (2 unread)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowChallenge(true)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="trophy" size={20} color="#00c2ff" />
              </View>
              <View>
                <Text className="text-white font-bold">Challenge Preview Modal</Text>
                <Text className="text-white/60 text-sm">30-Day Fitness Challenge</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowGivePoints(true)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="gift" size={20} color="#00c2ff" />
              </View>
              <View>
                <Text className="text-white font-bold">Give Points Modal</Text>
                <Text className="text-white/60 text-sm">Give ability points to Sarah</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowGroup(true)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="people" size={20} color="#00c2ff" />
              </View>
              <View>
                <Text className="text-white font-bold">Group Info Modal</Text>
                <Text className="text-white/60 text-sm">Boro Runners - 247 members</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          {/* Features List */}
          <View className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
            <Text className="text-white font-bold mb-3">Modal Features:</Text>
            <View className="space-y-2">
              <Text className="text-white/70 text-sm">• Slide up animation</Text>
              <Text className="text-white/70 text-sm">• Page sheet presentation</Text>
              <Text className="text-white/70 text-sm">• Rounded top corners</Text>
              <Text className="text-white/70 text-sm">• Dark theme (#1a1a1a)</Text>
              <Text className="text-white/70 text-sm">• Close button in header</Text>
              <Text className="text-white/70 text-sm">• Responsive heights (60-85vh)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={mockNotifications}
      />

      <ChallengePreviewModal
        visible={showChallenge}
        onClose={() => setShowChallenge(false)}
        challenge={mockChallenge}
        onViewChallenge={handleViewChallenge}
      />

      <GivePointsModal
        visible={showGivePoints}
        onClose={() => setShowGivePoints(false)}
        post={mockPost}
        onConfirm={handleConfirmPoints}
      />

      <GroupInfoModal
        visible={showGroup}
        onClose={() => setShowGroup(false)}
        group={mockGroup}
      />
    </SafeAreaView>
  );
}
