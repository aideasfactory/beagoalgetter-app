import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Modal, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SearchBar } from '@/components/SearchBar';
import { ChallengeCard, Challenge } from '@/components/ChallengeCard';
import { JoinChallengeModal, JoinChallengeContent } from '@/components/JoinChallengeModal';

// Mock challenge data - will be replaced with Supabase data later
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
    status: 'completed',
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
    isJoined: true,
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
    isJoined: true,
  },
  {
    id: 'c5',
    title: 'Yoga Streak',
    description: 'Daily yoga practice for flexibility',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    type: 'Personal',
    progress: 60,
    daysCompleted: 18,
    totalDays: 30,
    currentStreak: 18,
    members: 1,
    status: 'active',
    endDate: 'Dec 15',
    isJoined: true,
  },
  {
    id: 'c6',
    title: 'Community Running Club',
    description: 'Run together, stay motivated',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
    type: 'Group',
    progress: 90,
    daysCompleted: 27,
    totalDays: 30,
    currentStreak: 25,
    members: 15,
    status: 'completed',
    endDate: 'Nov 25',
    isJoined: true,
  },
];

type FilterType = 'All' | 'Personal' | 'Group';

export default function ChallengesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinCodeError, setJoinCodeError] = useState('');
  const [joinByCodeChallenge, setJoinByCodeChallenge] = useState<Challenge | null>(null);
  const [hideCompleted, setHideCompleted] = useState(true);

  // Filter and search challenges
  const filteredChallenges = useMemo(() => {
    let filtered = mockChallenges;

    // Apply type filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(challenge => challenge.type === activeFilter);
    }

    // Hide completed challenges when toggle is enabled
    if (hideCompleted) {
      filtered = filtered.filter((challenge) => challenge.status !== 'completed');
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        challenge =>
          challenge.title.toLowerCase().includes(query) ||
          challenge.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeFilter, hideCompleted]);

  const handleChallengePress = (challengeId: string) => {
    const challenge = mockChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // If user has joined the challenge, navigate to details
    if (challenge.isJoined) {
      router.push(`/challenge/${challengeId}`);
    } else {
      // If not joined, show join modal
      setSelectedChallenge(challenge);
      setShowJoinModal(true);
    }
  };

  const handleJoinChallenge = (challengeId: string) => {
    // TODO: Implement Supabase join logic
    Alert.alert('Success!', 'You have joined the challenge!', [
      {
        text: 'View Challenge',
        onPress: () => router.push(`/challenge/${challengeId}`),
      },
      { text: 'OK', style: 'cancel' },
    ]);
    console.log('Joined challenge:', challengeId);
  };

  const handleCreateChallenge = () => {
    router.push('/challenge/create');
  };

  const filters: FilterType[] = ['All', 'Personal', 'Group'];

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'All') return mockChallenges.length;
    return mockChallenges.filter(c => c.type === filter).length;
  };

  const handleOpenJoinByCode = () => {
    setShowJoinByCodeModal(true);
    setJoinCode('');
    setJoinCodeError('');
    setJoinByCodeChallenge(null);
  };

  const resolveJoinCode = (code: string): Challenge | null => {
    const trimmed = code.trim().toLowerCase();
    const codeToChallengeId: Record<string, string> = {
      '1234': 'c4',
      'water': 'c4',
    };

    const challengeId = codeToChallengeId[trimmed];
    if (!challengeId) return null;

    return mockChallenges.find((c) => c.id === challengeId) ?? null;
  };

  const handleSubmitJoinCode = () => {
    const challenge = resolveJoinCode(joinCode);
    if (!challenge) {
      setJoinCodeError('Code not recognized. Please check and try again.');
      return;
    }

    setJoinByCodeChallenge(challenge);
    setJoinCodeError('');
  };

  const handleCloseJoinByCodeModal = () => {
    setShowJoinByCodeModal(false);
    setJoinCode('');
    setJoinCodeError('');
    setJoinByCodeChallenge(null);
  };

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

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search challenges..."
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-grow-0"
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

      {/* Hide completed row */}
      <View className="px-4 pb-2 pt-1 border-b border-white/10 flex-row items-center justify-between">
        <Text className="text-white/70 text-xs">Hide completed challenges</Text>
        <Switch
          value={hideCompleted}
          onValueChange={setHideCompleted}
          thumbColor={hideCompleted ? '#00c2ff' : '#f4f3f4'}
          trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#00c2ff' }}
        />
      </View>

      {/* Challenge Grid */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                <Ionicons name="search-outline" size={40} color="rgba(255,255,255,0.4)" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">No Challenges Found</Text>
              <Text className="text-white/60 text-center px-8 mb-6">
                {searchQuery
                  ? `No challenges match "${searchQuery}"`
                  : `No ${activeFilter.toLowerCase()} challenges available`}
              </Text>
              {activeFilter === 'All' && !searchQuery && (
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
                  <View className="w-10 h-10 rounded-full bg-[#00c2ff20] items-center justify-center mr-3">
                    <Ionicons name="key-outline" size={22} color="#00c2ff" />
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
                  placeholder="E.g. 1234"
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

                <View className="flex-row flex-wrap items-center justify-center gap-2 mt-4">
                  <Text className="text-white/40 text-xs">Try a demo code:</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setJoinCode('1234');
                      setJoinCodeError('');
                    }}
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/20"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-xs font-medium">1234</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-auto">
                <TouchableOpacity
                  onPress={handleSubmitJoinCode}
                  disabled={!joinCode.trim()}
                  className="rounded-xl py-4 items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: joinCode.trim() ? '#00c2ff' : 'rgba(255,255,255,0.2)' }}
                  activeOpacity={joinCode.trim() ? 0.8 : 1}
                >
                  <Ionicons
                    name="arrow-forward-circle"
                    size={22}
                    color={joinCode.trim() ? '#000000' : 'rgba(0,0,0,0.4)'}
                  />
                  <Text
                    className="font-bold text-lg"
                    style={{ color: joinCode.trim() ? '#000000' : 'rgba(0,0,0,0.4)' }}
                  >
                    Continue
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
