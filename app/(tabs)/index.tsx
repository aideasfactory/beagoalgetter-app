import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
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
import type { NotificationWithUser } from '@/types/database.example';
import { useUserNotifications, useFeedPosts } from '@/hooks';
import type { FeedPost } from '@/hooks/useFeedPosts';
import { groupService, postService } from '@/services';

type TabType = 'all' | 'my-challenges';

export default function HomeScreen() {
  const {
    notifications: dbNotifications,
    unreadCount,
  } = useUserNotifications();

  const mappedNotifications: Notification[] = useMemo(
    () =>
      dbNotifications.map((n: NotificationWithUser) => ({
        id: n.id,
        type: n.type as Notification['type'],
        message: n.message,
        user:
          n.from_user_display_name || n.from_user_username || n.from_user_avatar_url
            ? {
                name:
                  n.from_user_display_name ||
                  n.from_user_username ||
                  'Someone',
                avatar: n.from_user_avatar_url || '',
              }
            : undefined,
        timestamp: new Date(n.created_at).toLocaleString(),
        read: n.read,
      })),
    [dbNotifications],
  );

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { posts, loading, refreshing, error, refetch, handleLike } = useFeedPosts(activeTab);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengePreview | null>(null);
  const [givePointsPost, setGivePointsPost] = useState<Post | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);

  const handleChallengeClick = useCallback(
    async (challengeId: string) => {
      const post = posts.find((p) => p.challenge.id === challengeId);
      if (post) {
        // Show modal immediately with basic data
        setSelectedChallenge({
          id: post.challenge.id,
          name: post.challenge.name,
          type: post.challenge.type,
          members: post.challenge.members,
        });

        // Fetch description in background
        try {
          const description = await postService.getChallengeDescription(challengeId);
          if (description) {
            setSelectedChallenge((prev) =>
              prev && prev.id === challengeId ? { ...prev, description } : prev,
            );
          }
        } catch {
          // Description fetch failed — modal shows fallback text
        }
      }
    },
    [posts],
  );

  const handleViewChallenge = () => {
    if (selectedChallenge) {
      router.push(`/challenge/${selectedChallenge.id}`);
      setSelectedChallenge(null);
    }
  };

  const handleGivePoints = (post: Post) => {
    setGivePointsPost(post);
  };

  const handleConfirmPoints = useCallback(
    async (points: number) => {
      if (!givePointsPost) return;
      try {
        await postService.giveAbilityPoints(givePointsPost.id, points);
      } catch {
        // Points save failed silently — trigger still shows success alert
      }
      setGivePointsPost(null);
    },
    [givePointsPost],
  );

  const handleGroupClick = useCallback(
    async (group: NonNullable<Post['group']>) => {
      // Find the post with this group to get the groupId
      const post = posts.find(
        (p): p is FeedPost => p.group?.name === group.name && !!(p as FeedPost).groupId,
      );
      const groupId = post?.groupId;

      if (!groupId) {
        // Fallback: show modal with basic info from the post
        setSelectedGroup({
          name: group.name,
          logo: group.logo,
          color: group.color,
          description: '',
          members: 0,
          challenges: 0,
          founded: '',
          location: '',
          stats: { totalRuns: 0, totalDistance: '0', activeMembers: 0 },
          recentMembers: [],
        });
        return;
      }

      try {
        const [groupData, challengeCount] = await Promise.all([
          groupService.getGroupById(groupId),
          groupService.getGroupChallengeCount(groupId),
        ]);

        if (groupData) {
          setSelectedGroup({
            name: groupData.name,
            logo: groupData.logo || group.logo,
            color: groupData.color || group.color,
            description: groupData.description || '',
            members: groupData.member_count,
            challenges: challengeCount,
            founded: groupData.founded || '',
            location: groupData.location || '',
            stats: { totalRuns: 0, totalDistance: '0', activeMembers: groupData.member_count },
            recentMembers: [],
          });
        }
      } catch {
        // Fallback to basic info from post on error
        setSelectedGroup({
          name: group.name,
          logo: group.logo,
          color: group.color,
          description: '',
          members: 0,
          challenges: 0,
          founded: '',
          location: '',
          stats: { totalRuns: 0, totalDistance: '0', activeMembers: 0 },
          recentMembers: [],
        });
      }
    },
    [posts],
  );

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
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            tintColor="#00c2ff"
            colors={['#00c2ff']}
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#00c2ff" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.4)" />
            <Text className="text-white/60 text-base mt-4 mb-4">Failed to load posts</Text>
            <TouchableOpacity
              onPress={refetch}
              className="px-6 py-2 rounded-lg"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Text className="text-black font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="newspaper-outline" size={48} color="rgba(255,255,255,0.4)" />
            <Text className="text-white/60 text-base mt-4">
              {activeTab === 'my-challenges'
                ? 'No posts from your challenges yet'
                : 'No posts yet'}
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onChallengeClick={handleChallengeClick}
              onGivePoints={handleGivePoints}
              onGroupClick={handleGroupClick}
              onLike={handleLike}
            />
          ))
        )}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modals */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={mappedNotifications}
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
