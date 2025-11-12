import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChallengeCard, Challenge } from '@/components/ChallengeCard';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

// Mock challenge data for testing
const mockChallenges: Challenge[] = [
  {
    id: 'c1',
    title: '30-Day Fitness Challenge',
    description: 'Daily workouts and healthy habits',
    image: 'https://images.unsplash.com/photo-1758684050596-15a238d24202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbW90aXZhdGlvbiUyMHJ1bm5lcnxlbnwxfHx8fDE3NjE5MTIxMjN8MA&ixlib=rb-4.1.0&q=80&w=400',
    type: 'Group',
    progress: 50,
    daysCompleted: 15,
    totalDays: 30,
    currentStreak: 15,
    members: 12,
    status: 'active',
    endDate: 'Nov 30',
    isJoined: true,
  },
  {
    id: 'c2',
    title: 'Read 20 Pages Daily',
    description: 'Build a consistent reading habit',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    type: 'Personal',
    progress: 27,
    daysCompleted: 8,
    totalDays: 30,
    currentStreak: 0,
    members: 1,
    status: 'active',
    endDate: 'Nov 30',
    isJoined: false,
  },
  {
    id: 'c3',
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness each morning',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    type: 'Personal',
    progress: 100,
    daysCompleted: 21,
    totalDays: 21,
    currentStreak: 21,
    members: 1,
    status: 'completed',
    endDate: 'Oct 21',
    isJoined: true,
  },
  {
    id: 'c4',
    title: 'Water Challenge',
    description: 'Drink 8 glasses of water daily',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    type: 'Group',
    progress: 85,
    daysCompleted: 17,
    totalDays: 20,
    currentStreak: 12,
    members: 24,
    status: 'active',
    endDate: 'Nov 20',
    isJoined: false,
  },
];

export default function ChallengeCardTestScreen() {
  const handleChallengePress = (challengeId: string) => {
    console.log('Challenge pressed:', challengeId);
    // Navigate to challenge details in real app
    // router.push(`/challenge/${challengeId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Challenge Card Test</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          <Text className="text-white/60 text-sm mb-4">
            Testing ChallengeCard component in 2-column grid layout
          </Text>

          {/* 2-Column Grid */}
          <View className="flex-row flex-wrap gap-4">
            {mockChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={handleChallengePress}
              />
            ))}
          </View>

          {/* Legend */}
          <View className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4">
            <Text className="text-white font-bold mb-3">Card Features:</Text>
            <View className="space-y-2">
              <Text className="text-white/70 text-sm">• Type badges: Personal (Purple), Group (Cyan)</Text>
              <Text className="text-white/70 text-sm">• Members count shown for multi-user challenges</Text>
              <Text className="text-white/70 text-sm">• Progress bar: Green for completed, Cyan for active</Text>
              <Text className="text-white/70 text-sm">• Streak indicator with flame icon</Text>
              <Text className="text-white/70 text-sm">• Join button for new challenges, View for joined</Text>
              <Text className="text-white/70 text-sm">• Completed badge for finished challenges</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
