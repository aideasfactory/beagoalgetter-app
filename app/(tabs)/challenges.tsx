import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Modal, TextInput, Switch, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { IconCircle } from '@/components/IconCircle';
import { router, useFocusEffect } from 'expo-router';
import { ChallengeCard } from '@/components/ChallengeCard';
import type { Challenge } from '@/components/ChallengeCard';
import { JoinChallengeModal, JoinChallengeContent } from '@/components/JoinChallengeModal';
import { useChallenges, useLookupByJoinCode, useJoinChallenge } from '@/hooks/useChallenges';

type FilterType = 'All' | 'Personal' | 'Group';

export default function ChallengesScreen() {
  const { challenges, loading, error, refetch } = useChallenges();
  const { lookupByCode, loading: lookupLoading } = useLookupByJoinCode();
  const { joinChallenge, loading: joinLoading } = useJoinChallenge();

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinCodeError, setJoinCodeError] = useState('');
  const [joinByCodeChallenge, setJoinByCodeChallenge] = useState<Challenge | null>(null);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Refetch challenges when screen comes back into focus (e.g. after creating a challenge)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    let filtered = challenges;

    // Apply type filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(challenge => challenge.type === activeFilter);
    }

    // Hide completed challenges when toggle is enabled
    if (hideCompleted) {
      filtered = filtered.filter((challenge) => challenge.status !== 'completed');
    }

    return filtered;
  }, [challenges, activeFilter, hideCompleted]);

  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const success = await joinChallenge(challengeId);
    if (success) {
      Alert.alert('Success!', 'You have joined the challenge!', [
        {
          text: 'View Challenge',
          onPress: () => {
            refetch();
            router.push(`/challenge/${challengeId}`);
          },
        },
        {
          text: 'OK',
          style: 'cancel',
          onPress: () => refetch(),
        },
      ]);
    } else {
      Alert.alert('Error', 'Failed to join the challenge. Please try again.');
    }
  };

  const handleCreateChallenge = () => {
    router.push('/challenge/create');
  };

  const filters: FilterType[] = ['All', 'Personal', 'Group'];

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'All') return challenges.length;
    return challenges.filter(c => c.type === filter).length;
  };

  const handleOpenJoinByCode = () => {
    setShowJoinByCodeModal(true);
    setJoinCode('');
    setJoinCodeError('');
    setJoinByCodeChallenge(null);
  };

  const handleSubmitJoinCode = async () => {
    if (!joinCode.trim()) return;

    try {
      const challenge = await lookupByCode(joinCode);
      if (!challenge) {
        setJoinCodeError('Code not recognized. Please check and try again.');
        return;
      }

      // Check if user already has this challenge
      const alreadyJoined = challenges.some((c) => c.id === challenge.id);
      if (alreadyJoined) {
        setJoinCodeError('You have already joined this challenge.');
        return;
      }

      setJoinByCodeChallenge(challenge);
      setJoinCodeError('');
    } catch {
      setJoinCodeError('Something went wrong. Please try again.');
    }
  };

  const handleCloseJoinByCodeModal = () => {
    setShowJoinByCodeModal(false);
    setJoinCode('');
    setJoinCodeError('');
    setJoinByCodeChallenge(null);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="px-4 py-4 border-b border-white/10">
          <Text className="text-white text-2xl font-bold">Challenges</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00c2ff" />
          <Text className="text-white/60 mt-4">Loading challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && challenges.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="px-4 py-4 border-b border-white/10">
          <Text className="text-white text-2xl font-bold">Challenges</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 items-center justify-center mb-4">
            <Ionicons name="warning-outline" size={40} color="#ef4444" />
          </View>
          <Text className="text-white text-xl font-bold mb-2">Something went wrong</Text>
          <Text className="text-white/60 text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={refetch}
            className="rounded-xl px-6 py-3"
            style={{ backgroundColor: '#00c2ff' }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="refresh" size={20} color="black" />
              <Text className="text-black font-bold">Retry</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-white/10">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-2xl font-bold">Challenges</Text>
          <TouchableOpacity
            onPress={handleOpenJoinByCode}
            className="flex-row items-center px-4 py-2 rounded-full border border-white/20 bg-white/5"
            activeOpacity={0.8}
          >
            <Ionicons name="enter-outline" size={18} color="#00c2ff" />
            <Text className="text-white font-medium ml-2">Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hide completed row */}
      <View className="px-4 pt-4 pb-3 border-b border-white/10">
        <View className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <View className="flex-1 pr-4">
            <Text className="text-white text-sm font-semibold">Hide completed challenges</Text>
            <Text className="text-white/50 text-xs mt-1">
              Keep your list focused on active challenges.
            </Text>
          </View>
          <Switch
            value={hideCompleted}
            onValueChange={setHideCompleted}
            thumbColor={hideCompleted ? '#cccccc' : '#f4f3f4'}
            trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#00c2ff' }}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-grow-0 border-b border-white/10"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <View className="flex-row items-center gap-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className="px-4 py-2 rounded-lg border border-white/10"
              style={{
                backgroundColor: activeFilter === filter ? '#00c2ff' : 'rgba(255,255,255,0.05)',
              }}
              activeOpacity={0.7}
            >
              <Text
                className="font-medium capitalize"
                style={{
                  color: activeFilter === filter ? '#000000' : 'rgba(255,255,255,0.6)',
                }}
              >
                {filter} ({getFilterCount(filter)})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Challenge Grid */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00c2ff"
            colors={['#00c2ff']}
          />
        }
      >
        <View className="px-4 py-6">
          {filteredChallenges.length > 0 ? (
            <View className="flex-row flex-wrap gap-4">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onPress={handleChallengePress}
                />
              ))}
            </View>
          ) : (
            // Empty State
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-4">
                <Ionicons name="trophy-outline" size={40} color="rgba(255,255,255,0.4)" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">No Challenges Found</Text>
              <Text className="text-white/60 text-center px-8 mb-6">
                {`No ${activeFilter.toLowerCase()} challenges available`}
              </Text>
              {activeFilter === 'All' && (
                <TouchableOpacity
                  onPress={handleCreateChallenge}
                  className="rounded-xl px-6 py-3"
                  style={{ backgroundColor: '#00c2ff' }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="add" size={20} color="black" />
                    <Text className="text-black font-bold">Create Challenge</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Bottom spacing for floating button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateChallenge}
        className="absolute w-14 h-14 rounded-full shadow-lg items-center justify-center"
        style={{
          backgroundColor: '#00c2ff',
          bottom: 100,
          right: 24,
          elevation: 5,
          shadowColor: '#00c2ff',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>

      {/* Join by Code Modal */}
      <Modal
        visible={showJoinByCodeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseJoinByCodeModal}
      >
        {joinByCodeChallenge ? (
          <JoinChallengeContent
            challenge={joinByCodeChallenge}
            onClose={handleCloseJoinByCodeModal}
            onJoin={handleJoinChallenge}
          />
        ) : (
          <View className="flex-1 bg-black">
            <View className="px-4 pt-12 pb-4 border-b border-white/10 flex-row items-center justify-between">
              <Text className="text-white text-2xl font-bold">Join Challenge</Text>
              <TouchableOpacity
                onPress={handleCloseJoinByCodeModal}
                className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
              <View className="mb-8">
                <Text className="text-white text-xl font-semibold mb-2">Join with a code</Text>
                <Text className="text-white/60">
                  Paste a code from a friend, coach, or team to unlock a private challenge.
                </Text>
              </View>

              <View className="bg-white/5 border border-white/15 rounded-2xl p-4 mb-8">
                <View className="flex-row items-center mb-4">
                  <View className="mr-3">
                    <IconCircle icon="key-outline" size="md" variant="tint" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">Invite code</Text>
                    <Text className="text-white/50 text-xs mt-0.5">
                      Codes are usually 4–8 characters long.
                    </Text>
                  </View>
                </View>

                <TextInput
                  value={joinCode}
                  onChangeText={(text) => {
                    setJoinCode(text.toUpperCase());
                    setJoinCodeError('');
                  }}
                  placeholder="E.g. ABC123"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="w-full rounded-xl border border-white/20 px-4 py-3 text-white bg-black/60 text-center tracking-[4px] text-lg"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  keyboardType="default"
                  maxLength={8}
                />

                {joinCodeError ? (
                  <Text className="text-red-400 text-xs mt-2 text-center">{joinCodeError}</Text>
                ) : null}
              </View>

              <View className="mt-auto">
                <TouchableOpacity
                  onPress={handleSubmitJoinCode}
                  disabled={!joinCode.trim() || lookupLoading}
                  className="rounded-xl py-4 items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: joinCode.trim() && !lookupLoading ? '#00c2ff' : 'rgba(255,255,255,0.2)' }}
                  activeOpacity={joinCode.trim() ? 0.8 : 1}
                >
                  {lookupLoading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Ionicons
                      name="arrow-forward-circle"
                      size={22}
                      color={joinCode.trim() ? '#000000' : 'rgba(0,0,0,0.4)'}
                    />
                  )}
                  <Text
                    className="font-bold text-lg"
                    style={{ color: joinCode.trim() && !lookupLoading ? '#000000' : 'rgba(0,0,0,0.4)' }}
                  >
                    {lookupLoading ? 'Looking up...' : 'Continue'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCloseJoinByCodeModal}
                  className="mt-4 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-white/50 text-sm">Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Join Challenge Modal */}
      <JoinChallengeModal
        visible={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedChallenge(null);
        }}
        challenge={selectedChallenge}
        onJoin={handleJoinChallenge}
      />
    </SafeAreaView>
  );
}
