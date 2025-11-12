import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PostCard, Post } from '@/components/PostCard';

// Mock post data for testing
const mockPosts: Post[] = [
  {
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
    group: {
      name: 'Boro Runners',
      logo: '🏃',
      color: '#991b1b',
    },
    type: 'success',
    message: 'Completed Day 15! Morning run + strength training ✓',
    image: 'https://images.unsplash.com/photo-1758684050596-15a238d24202?w=600',
    note: 'Felt amazing today! The morning run was tough but worth it.',
    timestamp: '2 hours ago',
    likes: 23,
    abilityPointsGiven: 5,
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      streak: 0,
      abilityPoints: 180,
    },
    challenge: {
      id: 'c2',
      name: 'Read 20 Pages Daily',
      type: 'Personal',
      members: 1,
    },
    type: 'fail',
    message: 'Missed Day 8 - Streak reset to 0',
    timestamp: '5 hours ago',
    likes: 8,
    abilityPointsGiven: 0,
  },
  {
    id: '3',
    user: {
      name: 'Emma Williams',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      streak: 22,
      abilityPoints: 310,
    },
    challenge: {
      id: 'c3',
      name: 'No Sugar November',
      type: 'Group',
      members: 8,
    },
    type: 'success',
    message: 'Day 22 complete! Resisted birthday cake at the office 🎉',
    timestamp: '1 day ago',
    likes: 45,
    abilityPointsGiven: 12,
  },
  {
    id: '4',
    user: {
      name: 'David Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      streak: 7,
      abilityPoints: 95,
    },
    challenge: {
      id: 'c1',
      name: '30-Day Fitness Challenge',
      type: 'Group',
      members: 12,
    },
    group: {
      name: 'Boro Runners',
      logo: '🏃',
      color: '#991b1b',
    },
    type: 'success',
    message: 'Week 1 done! Consistency is key 💪',
    note: 'Looking forward to week 2!',
    timestamp: '1 day ago',
    likes: 18,
    abilityPointsGiven: 3,
  },
];

export default function PostCardTestScreen() {
  const handleChallengeClick = (challengeId: string) => {
    Alert.alert('Challenge Clicked', `Challenge ID: ${challengeId}`);
  };

  const handleGivePoints = (post: Post) => {
    Alert.alert('Give Points', `Give points to ${post.user.name}`);
  };

  const handleGroupClick = (group: NonNullable<Post['group']>) => {
    Alert.alert('Group Clicked', `Group: ${group.name}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Post Card Test</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          <Text className="text-white/60 text-sm mb-4">
            Testing PostCard component with various post types
          </Text>

          {/* Render all test posts */}
          {mockPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onChallengeClick={handleChallengeClick}
              onGivePoints={handleGivePoints}
              onGroupClick={handleGroupClick}
            />
          ))}

          {/* Features Legend */}
          <View className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <Text className="text-white font-bold mb-3">Card Features:</Text>
            <View className="space-y-2">
              <Text className="text-white/70 text-sm">• Success/Fail ribbon (rotated 45° in corner)</Text>
              <Text className="text-white/70 text-sm">• Optional Group banner with color</Text>
              <Text className="text-white/70 text-sm">• User avatar with streak badge (🔥)</Text>
              <Text className="text-white/70 text-sm">• Challenge name (underlined, clickable)</Text>
              <Text className="text-white/70 text-sm">• Post message and optional note</Text>
              <Text className="text-white/70 text-sm">• Optional post image</Text>
              <Text className="text-white/70 text-sm">• Like & Give Points buttons</Text>
              <Text className="text-white/70 text-sm">• Ability Points indicator (if given)</Text>
              <Text className="text-white/70 text-sm">• Timestamp display</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
