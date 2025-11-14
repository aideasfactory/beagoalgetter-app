import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { TaskTrackerTab, LeaderboardTab, MessagesTab, AdminTab } from '@/components/challenge-tabs';

// Mock challenge data (replace with Supabase query)
const mockChallengeData = {
  id: 'c1',
  title: '30-Day Fitness Challenge',
  description: 'Build consistency with daily workouts and healthy habits. Track your progress, stay accountable, and achieve your fitness goals together!',
  image: 'https://images.unsplash.com/photo-1758520705189-a6b56a7ae832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwcnVubmluZyUyMG1vdGl2YXRpb258ZW58MXx8fHwxNzYyMjg5MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  type: 'Group',
  progress: 50,
  daysCompleted: 15,
  totalDays: 30,
  currentStreak: 15,
  members: 12,
  startDate: 'Oct 1, 2025',
  endDate: 'Oct 30, 2025',
  totalPoints: 1250,
  createdById: 'user-1',
};

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'messages' | 'admin'>('tasks');

  // TODO: Fetch challenge data from Supabase using id
  const challenge = mockChallengeData;
  const currentUserId = 'user-1'; // TODO: Replace with authenticated user id
  const isGroupChallenge = challenge.type === 'Group';
  const isChallengeOwner = challenge.createdById === currentUserId;
  const showLeaderboardTab = isGroupChallenge;
  const showAdminTab = isGroupChallenge && isChallengeOwner;

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image Header */}
        <View style={{ height: 480, position: 'relative' }}>
          {/* Background Image */}
          <Image
            source={{ uri: challenge.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          
          {/* Dark Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.5)', '#000000']}
            locations={[0, 0.6, 1]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Top Actions */}
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }} edges={['top']}>
            <View className="px-4 py-2 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border border-white/10"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Challenge Title and Type */}
          <View style={{ position: 'absolute', top: 100, left: 0, right: 0 }} className="px-6">
            <View className="flex-row items-center mb-3">
              <View className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                <Text className="text-white text-xs font-bold">
                  {challenge.type} • {challenge.members} members
                </Text>
              </View>
            </View>
            <Text className="text-white text-3xl font-bold mb-2" style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 8 }}>
              {challenge.title}
            </Text>
          </View>

          {/* Stats Overlay - Bottom of Hero */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} className="px-6 pb-8">
            <View className="flex-row gap-3">
              {/* Streak */}
              <View className="flex-1 rounded-2xl p-4 items-center border border-white/20" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View className="w-10 h-10 rounded-xl mb-2 items-center justify-center" style={{ backgroundColor: '#00c2ff' }}>
                  <Ionicons name="trending-up" size={20} color="black" />
                </View>
                <Text className="text-white font-bold mb-1">{challenge.currentStreak}</Text>
                <Text className="text-white/80 text-xs">Streak</Text>
              </View>

              {/* Points */}
              <View className="flex-1 rounded-2xl p-4 items-center border border-white/20" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View className="w-10 h-10 rounded-xl mb-2 items-center justify-center" style={{ backgroundColor: '#84cc16' }}>
                  <Ionicons name="trophy" size={20} color="black" />
                </View>
                <Text className="text-white font-bold mb-1">{challenge.totalPoints}</Text>
                <Text className="text-white/80 text-xs">Points</Text>
              </View>

              {/* Members */}
              <View className="flex-1 rounded-2xl p-4 items-center border border-white/20" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View className="w-10 h-10 rounded-xl mb-2 items-center justify-center" style={{ backgroundColor: '#a855f7' }}>
                  <Ionicons name="people" size={20} color="black" />
                </View>
                <Text className="text-white font-bold mb-1">{challenge.members}</Text>
                <Text className="text-white/80 text-xs">Active</Text>
              </View>

              {/* Days Remaining */}
              <View className="flex-1 rounded-2xl p-4 items-center border border-white/20" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View className="w-10 h-10 rounded-xl mb-2 items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                  <Ionicons name="calendar" size={20} color="black" />
                </View>
                <Text className="text-white font-bold mb-1">{challenge.totalDays - challenge.daysCompleted}</Text>
                <Text className="text-white/80 text-xs">Remaining</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View className="px-6 pt-6 pb-4">
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-white/60 text-sm">Overall Progress</Text>
              <Text className="text-sm" style={{ color: '#00c2ff' }}>
                {challenge.daysCompleted}/{challenge.totalDays} days
              </Text>
            </View>
            <View className="h-3 bg-white/10 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ width: `${challenge.progress}%`, backgroundColor: '#00c2ff' }}
              />
            </View>
          </View>

          <Text className="text-white/60 text-sm leading-relaxed">
            {challenge.description}
          </Text>
        </View>

        {/* Tabs Navigation */}
        <View className="border-b border-white/10">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveTab('tasks')}
              className="flex-1 py-4 flex-row items-center justify-center gap-2"
              style={{ 
                borderBottomWidth: activeTab === 'tasks' ? 2 : 0, 
                borderBottomColor: '#00c2ff' 
              }}
            >
              <Ionicons 
                name="checkbox" 
                size={16} 
                color={activeTab === 'tasks' ? 'white' : 'rgba(255,255,255,0.6)'} 
              />
              <Text className={activeTab === 'tasks' ? 'text-white font-bold' : 'text-white/60'}>
                Tasks
              </Text>
            </TouchableOpacity>

            {showLeaderboardTab && (
              <TouchableOpacity
                onPress={() => setActiveTab('leaderboard')}
                className="flex-1 py-4 flex-row items-center justify-center gap-2"
                style={{
                  borderBottomWidth: activeTab === 'leaderboard' ? 2 : 0,
                  borderBottomColor: '#00c2ff',
                }}
              >
                <Ionicons
                  name="bar-chart"
                  size={16}
                  color={activeTab === 'leaderboard' ? 'white' : 'rgba(255,255,255,0.6)'}
                />
                <Text className={activeTab === 'leaderboard' ? 'text-white font-bold' : 'text-white/60'}>
                  Leaderboard
                </Text>
              </TouchableOpacity>
            )}

            {showAdminTab && (
              <TouchableOpacity
                onPress={() => setActiveTab('admin')}
                className="flex-1 py-4 flex-row items-center justify-center gap-2"
                style={{
                  borderBottomWidth: activeTab === 'admin' ? 2 : 0,
                  borderBottomColor: '#00c2ff',
                }}
              >
                <Ionicons
                  name="settings"
                  size={16}
                  color={activeTab === 'admin' ? 'white' : 'rgba(255,255,255,0.6)'}
                />
                <Text className={activeTab === 'admin' ? 'text-white font-bold' : 'text-white/60'}>
                  Admin
                </Text>
              </TouchableOpacity>
            )}

            {/* <TouchableOpacity
              onPress={() => setActiveTab('messages')}
              className="flex-1 py-4 flex-row items-center justify-center gap-2"
              style={{ 
                borderBottomWidth: activeTab === 'messages' ? 2 : 0, 
                borderBottomColor: '#00c2ff' 
              }}
            >
              <Ionicons 
                name="chatbox" 
                size={16} 
                color={activeTab === 'messages' ? 'white' : 'rgba(255,255,255,0.6)'} 
              />
              <Text className={activeTab === 'messages' ? 'text-white font-bold' : 'text-white/60'}>
                Messages
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Tab Content */}
        <View style={{ minHeight: 600 }}>
          {activeTab === 'tasks' && <TaskTrackerTab challengeId={id} />}
          {activeTab === 'leaderboard' && showLeaderboardTab && <LeaderboardTab challengeId={id} />}
          {activeTab === 'admin' && showAdminTab && <AdminTab challengeId={id} />}
          {/* {activeTab === 'messages' && <MessagesTab challengeId={id} />} */}
        </View>

        {/* Add padding at bottom for fixed action buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
