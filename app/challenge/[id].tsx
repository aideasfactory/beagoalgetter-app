import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { TaskTrackerTab, LeaderboardTab, MessagesTab, AdminTab } from '@/components/challenge-tabs';
import { useChallengeDetail } from '@/hooks/useChallengeDetail';
import { useSession } from '@/context/auth';

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { challenge, loading, error, refetch } = useChallengeDetail(id);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'messages' | 'admin'>('tasks');

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#00c2ff" />
      </View>
    );
  }

  if (error || !challenge) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.4)" />
        <Text className="text-white/60 mt-4 mb-4 text-center">
          {error || 'Challenge not found'}
        </Text>
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

  const currentUserId = user?.id || '';
  const isGroupChallenge = challenge.type === 'group';
  const isChallengeOwner = challenge.created_by === currentUserId;
  const showLeaderboardTab = isGroupChallenge;
  const showAdminTab = isGroupChallenge && isChallengeOwner;
  const typeLabel = challenge.type === 'personal' ? 'Personal' : 'Group';
  const challengeNotStarted = !challenge.hasStarted;
  const showJoinCode = isGroupChallenge && isChallengeOwner && !!challenge.join_code;

  const handleCopyJoinCode = async () => {
    if (challenge.join_code) {
      await Clipboard.setStringAsync(challenge.join_code);
      Alert.alert('Copied!', 'Join code copied to clipboard');
    }
  };

  // Format start date for display
  const formattedStartDate = challenge.start_date
    ? new Date(challenge.start_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image Header */}
        <View style={{ height: 480, position: 'relative' }}>
          {/* Background Image */}
          {challenge.image_url ? (
            <Image
              source={{ uri: challenge.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-full bg-white/5 items-center justify-center">
              <Ionicons name="trophy" size={64} color="rgba(255,255,255,0.2)" />
            </View>
          )}

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
            <Text className="text-white text-3xl font-bold tracking-tight mb-2" style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 8 }}>
              {challenge.title}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                <Text className="text-white text-xs font-bold">
                  {typeLabel} • {challenge.participant_count} members
                </Text>
              </View>
              {showJoinCode && (
                <TouchableOpacity
                  onPress={handleCopyJoinCode}
                  className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border border-white/20"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <Ionicons name="key-outline" size={12} color="#00c2ff" />
                  <Text className="text-cyan-400 font-bold text-xs tracking-widest">
                    {challenge.join_code}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
                <Text className="text-white font-bold mb-1">{challenge.participant_count}</Text>
                <Text className="text-white/80 text-xs">Active</Text>
              </View>

              {/* Days Remaining */}
              <View className="flex-1 rounded-2xl p-4 items-center border border-white/20" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View className="w-10 h-10 rounded-xl mb-2 items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                  <Ionicons name="calendar" size={20} color="black" />
                </View>
                <Text className="text-white font-bold mb-1">{challenge.daysRemaining}</Text>
                <Text className="text-white/80 text-xs">Days</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View className="px-6 pt-6 pb-4">
          {!challengeNotStarted && (
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
          )}

          <Text className="text-white/60 text-sm leading-relaxed">
            {challenge.description}
          </Text>

          {/* Pre-Start Countdown Banner */}
          {challengeNotStarted && (
            <View
              className="mt-4 rounded-2xl p-8 items-center"
              style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.3)' }}
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)' }}
              >
                <Ionicons name="time-outline" size={40} color="#f97316" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2 text-center">
                Challenge starts in {challenge.daysUntilStart} {challenge.daysUntilStart === 1 ? 'day' : 'days'}
              </Text>
              {formattedStartDate && (
                <View className="flex-row items-center gap-2 mt-2">
                  <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white/60 text-sm">{formattedStartDate}</Text>
                </View>
              )}
              <Text className="text-white/50 text-sm mt-4 text-center leading-relaxed">
                Get ready! You&apos;ll be able to start completing tasks once the challenge begins.
              </Text>
            </View>
          )}

          {/* Challenge Completed Banner */}
          {challenge.participantStatus === 'completed' && (
            <View
              className="mt-4 p-4 rounded-2xl items-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="trophy" size={24} color="#10b981" />
                <Text className="text-lg font-bold" style={{ color: '#10b981' }}>
                  Challenge Completed!
                </Text>
              </View>
              <Text className="text-white/60 text-sm mt-1 text-center">
                You&apos;ve successfully finished this challenge. Great work!
              </Text>
            </View>
          )}

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
          {activeTab === 'tasks' && !challengeNotStarted && (
            <TaskTrackerTab
              challengeId={id}
              challengeTitle={challenge.title}
              currentStreak={challenge.currentStreak}
              onDayCompleted={refetch}
            />
          )}
          {activeTab === 'leaderboard' && showLeaderboardTab && <LeaderboardTab challengeId={id} />}
          {activeTab === 'admin' && showAdminTab && <AdminTab challengeId={id} groupId={challenge.group_id} />}
          {/* {activeTab === 'messages' && <MessagesTab challengeId={id} />} */}
        </View>

        {/* Add padding at bottom for fixed action buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
