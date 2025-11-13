import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  PostCard,
  Post,
  NotificationsModal,
  Notification,
  ChallengePreviewModal,
  ChallengePreview,
  GivePointsModal,
  GroupInfoModal,
  GroupInfo,
} from '@/components';

// Mock notifications data
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

// Mock group data
const boroRunnersGroup: GroupInfo = {
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

// Mock feed posts data
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
    image: 'https://images.unsplash.com/photo-1689007669034-9ef988d89742?w=600',
    timestamp: '1 day ago',
    likes: 31,
    abilityPointsGiven: 8,
  },
];

type TabType = 'all' | 'my-challenges';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengePreview | null>(null);
  const [givePointsPost, setGivePointsPost] = useState<Post | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);

  // Filter posts based on active tab (mock filter for now)
  const filteredPosts = useMemo(() => {
    if (activeTab === 'my-challenges') {
      // Filter to only show posts from challenges the user is in (c1 in this example)
      return mockPosts.filter((post) => post.challenge.id === 'c1' || post.challenge.id === 'c2');
    }
    return mockPosts;
  }, [activeTab]);

  // Count unread notifications
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleChallengeClick = (challengeId: string) => {
    // Find the challenge from the posts
    const post = mockPosts.find((p) => p.challenge.id === challengeId);
    if (post) {
      setSelectedChallenge({
        id: post.challenge.id,
        name: post.challenge.name,
        type: post.challenge.type,
        members: post.challenge.members,
        duration: '30 Days',
        completionPercentage: 45,
      });
    }
  };

  const handleViewChallenge = () => {
    if (selectedChallenge) {
      // Navigate to challenge details
      console.log('Navigate to challenge:', selectedChallenge.id);
      // router.push(`/challenge/${selectedChallenge.id}`);
      setSelectedChallenge(null);
    }
  };

  const handleGivePoints = (post: Post) => {
    setGivePointsPost(post);
  };

  const handleConfirmPoints = (points: number) => {
    console.log(`Gave ${points} points to ${givePointsPost?.user.name}`);
    setGivePointsPost(null);
  };

  const handleGroupClick = (group: NonNullable<Post['group']>) => {
    setSelectedGroup(boroRunnersGroup);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Navigation */}
      <View className="px-4 py-4 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          {/* Logo */}
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 120, height: 32 }}
            resizeMode="contain"
          />

          {/* Notification Bell */}
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            className="relative w-10 h-10 items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <View
                className="absolute top-1 right-1 w-4 h-4 rounded-full items-center justify-center"
                style={{ backgroundColor: '#00c2ff' }}
              >
                <Text className="text-black text-[10px] font-bold">{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Filter */}
        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            className="flex-1 py-2 rounded-lg border border-white/10"
            style={{ backgroundColor: activeTab === 'all' ? '#00c2ff' : 'rgba(255,255,255,0.05)' }}
          >
            <Text
              className="text-center font-bold"
              style={{ color: activeTab === 'all' ? '#000000' : 'rgba(255,255,255,0.6)' }}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('my-challenges')}
            className="flex-1 py-2 rounded-lg border border-white/10"
            style={{
              backgroundColor: activeTab === 'my-challenges' ? '#00c2ff' : 'rgba(255,255,255,0.05)',
            }}
          >
            <Text
              className="text-center font-bold"
              style={{
                color: activeTab === 'my-challenges' ? '#000000' : 'rgba(255,255,255,0.6)',
              }}
            >
              My Challenges
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChallengeClick={handleChallengeClick}
            onGivePoints={handleGivePoints}
            onGroupClick={handleGroupClick}
          />
        ))}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modals */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={mockNotifications}
      />

      <ChallengePreviewModal
        visible={selectedChallenge !== null}
        onClose={() => setSelectedChallenge(null)}
        challenge={selectedChallenge}
        onViewChallenge={handleViewChallenge}
      />

      <GivePointsModal
        visible={givePointsPost !== null}
        onClose={() => setGivePointsPost(null)}
        post={givePointsPost}
        onConfirm={handleConfirmPoints}
      />

      <GroupInfoModal
        visible={selectedGroup !== null}
        onClose={() => setSelectedGroup(null)}
        group={selectedGroup}
      />
    </SafeAreaView>
  );
}
