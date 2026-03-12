import { useSession, useSubscription } from '@/context';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { LoadingScreen, GroupCard } from '@/components';
import { useProfile, useMyGroups } from '@/hooks';
import { groupService } from '@/services';
import type { ProfileBadges, Group } from '@/types/database.example';

// Circular Progress Component
function CircularProgress({ 
  value, 
  max, 
  color, 
  label, 
  sublabel 
}: { 
  value: number; 
  max: number; 
  color: string; 
  label: string; 
  sublabel: string;
}) {
  const percentage = (value / max) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View className="items-center">
      <View style={{ width: 128, height: 128 }}>
        <Svg width="128" height="128" style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <Circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-white text-3xl font-bold">{value}</Text>
          <Text className="text-white/60 text-xs">{sublabel}</Text>
        </View>
      </View>
      <Text className="text-white text-sm mt-2">{label}</Text>
    </View>
  );
}

export default function ProfileMain() {
  const { user } = useSession();
  const { profile, loading, error, refetch } = useProfile();
  const { isPaid, showPaywall, isLoading: subscriptionLoading } = useSubscription();
  const { groups, loading: groupsLoading, refetch: refetchGroups } = useMyGroups();

  // Refetch profile and groups when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchGroups();
    }, [refetch, refetchGroups])
  );

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupBrandColor, setGroupBrandColor] = useState('#00c2ff');
  const [groupLogo, setGroupLogo] = useState<string | null>(null);
  const [totalMembers, setTotalMembers] = useState('');
  const [inceptionDate, setInceptionDate] = useState('');

  // Preset colors for group branding
  const presetColors = [
    '#00c2ff', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#a855f7', // Purple
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#eab308', // Yellow
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Emerald
  ];

  const longestStreak = profile?.longest_streak ?? 0;
  const currentStreak = profile?.current_streak ?? longestStreak;
  const completedChallenges = profile?.challenges_completed ?? 0;
  const totalChallenges = profile?.total_challenges ?? completedChallenges;
  const activeChallenges = profile?.active_challenges ?? 0;
  const totalPoints = profile?.total_ability_points ?? 0;

  const defaultBadges: ProfileBadges = {
    first_challenge: false,
    streak_7_days: false,
    streak_30_days: false,
    team_player: false,
    streak_100_days: false,
    perfect_month: false,
  };

  const profileBadges: ProfileBadges = profile?.badges ?? defaultBadges;

  const badges = [
    { id: 1, name: 'First\nChallenge', icon: '🎯', earned: profileBadges.first_challenge, color: '#1e3a5f' },
    { id: 2, name: '7 Day Streak', icon: '🔥', earned: profileBadges.streak_7_days, color: '#5f1e1e' },
    { id: 3, name: '30 Day\nStreak', icon: '💪', earned: profileBadges.streak_30_days, color: '#3a5f1e' },
    { id: 4, name: 'Team Player', icon: '🤝', earned: profileBadges.team_player, color: '#4a1e5f' },
    { id: 5, name: '100 Day\nStreak', icon: '🏆', earned: profileBadges.streak_100_days, color: '#2a2a2a' },
    { id: 6, name: 'Perfect\Challenge', icon: '⭐', earned: profileBadges.perfect_month, color: '#2a2a2a' },
  ];

  const socialConnections = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', connected: true, gradient: ['#833ab4', '#fd1d1d'] },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', connected: false, gradient: ['#1da1f2', '#1da1f2'] },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', connected: false, gradient: ['#1877f2', '#1877f2'] },
  ];

  // Default avatar if none provided
  const avatarUrl =
    profile?.avatar_url ||
    user?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Default';
  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.full_name ||
    'User';
  const username = profile?.username || user?.user_metadata?.username || '';
  const bio = profile?.bio || '';

  const resetGroupForm = () => {
    setGroupName('');
    setGroupDescription('');
    setGroupBrandColor('#00c2ff');
    setGroupLogo(null);
    setTotalMembers('');
    setInceptionDate('');
  };

  const handleCloseGroupModal = () => {
    setIsCreateGroupOpen(false);
    setEditingGroup(null);
    resetGroupForm();
  };

  const handlePickGroupLogo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setGroupLogo(result.assets[0].uri);
    }
  };

  const handleSaveGroup = async () => {
    if (!groupName || !groupDescription || !totalMembers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSavingGroup(true);
    try {
      let logoUrl: string | null = groupLogo;
      if (groupLogo && !groupLogo.startsWith('http')) {
        logoUrl = await groupService.uploadGroupLogo(groupLogo);
      }

      if (editingGroup) {
        await groupService.updateGroup(editingGroup.id, {
          name: groupName,
          description: groupDescription,
          color: groupBrandColor,
          logo: logoUrl,
          member_count: parseInt(totalMembers) || 0,
          founded: inceptionDate || null,
        });
      } else {
        await groupService.createGroup({
          name: groupName,
          description: groupDescription,
          color: groupBrandColor,
          logo: logoUrl,
          member_count: parseInt(totalMembers) || 0,
          founded: inceptionDate || null,
        });
      }

      handleCloseGroupModal();
      refetchGroups();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save group. Please try again.');
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupBrandColor(group.color || '#00c2ff');
    setGroupLogo(group.logo);
    setTotalMembers(String(group.member_count));
    setInceptionDate(group.founded || '');
    setIsCreateGroupOpen(true);
  };

  const handleDeleteGroup = (group: Group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupService.deleteGroup(group.id);
              refetchGroups();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete group.');
            }
          },
        },
      ]
    );
  };

  const handleCreateGroupPress = async () => {
    console.log('[CreateGroup Debug] Button pressed');
    console.log('[CreateGroup Debug] user:', user?.id);
    console.log('[CreateGroup Debug] profile:', !!profile, '| plan:', profile?.plan);
    console.log('[CreateGroup Debug] isPaid:', isPaid);
    console.log('[CreateGroup Debug] loading:', loading, '| subscriptionLoading:', subscriptionLoading);

    if (loading || subscriptionLoading) {
      console.log('[CreateGroup Debug] -> Blocked: still loading');
      Alert.alert('Please wait', 'Loading your profile...');
      return;
    }

    if (!profile) {
      console.log('[CreateGroup Debug] -> Blocked: no profile');
      Alert.alert('No profile', 'You need to be signed in to create a group.');
      return;
    }

    // Check if user has paid subscription (pro or lifetime)
    if (!isPaid) {
      console.log('[CreateGroup Debug] -> Showing paywall (isPaid is false)');
      await showPaywall('goalgetter');
      return;
    }

    console.log('[CreateGroup Debug] -> Opening create group modal');
    setIsCreateGroupOpen(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <LoadingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView className="flex-1">
        {error && (
          <View className="px-4 pt-4">
            <View className="rounded-xl bg-red-900/40 border border-red-500/40 px-3 py-2">
              <Text className="text-red-100 text-xs">
                Failed to load profile. Pull to refresh or try again later.
              </Text>
            </View>
          </View>
        )}

        {/* Header */}
        <View className="items-center py-8">
          <TouchableOpacity className="relative" onPress={() => router.push('/(tabs)/profile/edit')}>
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <View
              style={{ backgroundColor: '#00c2ff' }}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-black"
            >
              <Ionicons name="camera" size={16} color="black" />
            </View>
          </TouchableOpacity>

          <Text className="text-white text-2xl font-bold mt-4">{displayName}</Text>
          <Text className="text-white/60">{username}</Text>
          <Text className="text-white/70 text-center mt-2 px-8">
            {bio}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/edit')}
            className="mt-4 px-6 py-2 rounded-full border border-white/20"
          >
            <Text className="text-white text-sm font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Circular Progress Stats */}
        <View className="px-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Your Progress</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 items-center">
              <CircularProgress
                value={currentStreak}
                max={longestStreak || 1}
                color="#00c2ff"
                label="Current Streak"
                sublabel="days"
              />
            </View>
            <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 items-center">
              <CircularProgress
                value={completedChallenges}
                max={totalChallenges || 1}
                color="#84cc16"
                label="Completed"
                sublabel={totalChallenges ? `of ${totalChallenges}` : 'challenges'}
              />
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View className="px-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Statistics</Text>
          <View className="flex-row flex-wrap gap-3">
            {/* Longest Streak */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#1e3a5f' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#00c2ff' }}>
                <Ionicons name="trending-up" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#00c2ff' }}>
                {longestStreak}
              </Text>
              <Text className="text-white/60 text-sm">Longest Streak</Text>
            </View>

            {/* Total Points */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#3a5f1e' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#84cc16' }}>
                <Ionicons name="medal" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#84cc16' }}>
                {totalPoints}
              </Text>
              <Text className="text-white/60 text-sm">Total Points</Text>
            </View>

            {/* Active Now */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#4a1e5f' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#a855f7' }}>
                <Ionicons name="radio-button-on" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#a855f7' }}>
                {activeChallenges}
              </Text>
              <Text className="text-white/60 text-sm">Active Now</Text>
            </View>

            {/* Total Challenges */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#5f3a1e' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#f97316' }}>
                <Ionicons name="trophy" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#f97316' }}>
                {totalChallenges}
              </Text>
              <Text className="text-white/60 text-sm">Total Challenges</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View className="px-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Badges</Text>
          <View className="flex-row flex-wrap gap-3">
            {badges.map((badge) => (
              <View
                key={badge.id}
                className="flex-1 min-w-[30%] rounded-xl p-4 items-center border"
                style={{
                  backgroundColor: badge.color,
                  borderColor: badge.earned ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  opacity: badge.earned ? 1 : 0.4,
                }}
              >
                <Text style={{ fontSize: 40 }} className="mb-2">{badge.icon}</Text>
                <Text className="text-white text-xs text-center" style={{ lineHeight: 16 }}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Create Group Section */}
        <View className="px-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Your Groups</Text>
          <View className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
            <View className="flex-row gap-4 mb-4">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: '#00c2ff20' }}>
                <Ionicons name="people" size={28} color="#00c2ff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-1">Create Your Own Group</Text>
                <Text className="text-white/60 text-sm">
                  Create a group to chase goals together — from reading challenges to accountability circles and beyond
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCreateGroupPress}
              className="rounded-xl py-4 items-center flex-row justify-center"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Ionicons name="add" size={24} color="black" />
              <Text className="text-black font-bold text-lg ml-2">Create New Group</Text>
            </TouchableOpacity>
          </View>

          {/* Group List */}
          {groupsLoading ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#00c2ff" />
            </View>
          ) : groups.length > 0 ? (
            <View className="mt-4 gap-3">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEdit={handleEditGroup}
                  onDelete={handleDeleteGroup}
                  onPress={() => {}}
                />
              ))}
            </View>
          ) : null}
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          className="bg-[#1a1a1a] mx-4 mb-32 bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3 bg-[#1a1a1a]">
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text className="text-white font-medium">Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={isCreateGroupOpen}
        onRequestClose={handleCloseGroupModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-[#1a1a1a]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
            <View style={{ width: 28 }} />
            <Text className="text-white text-xl font-bold">
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </Text>
            <TouchableOpacity onPress={handleCloseGroupModal}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={true}
          >
            <Text className="text-white/60 text-sm text-center mb-8">
              Fill in the details to create your goal group
            </Text>

            {/* Group Name */}
            <View className="mb-6">
              <Text className="text-white text-base mb-2">Group Name *</Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g., Boro Runners"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white text-base mb-2">Description *</Text>
              <TextInput
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Tell members what your group is about..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={4}
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
                style={{ minHeight: 120, textAlignVertical: 'top' }}
              />
            </View>

            {/* Brand Color */}
            <View className="mb-6">
              <Text className="text-white text-base mb-3">Brand Color</Text>
              
              {/* Color Picker Grid */}
              <View className="flex-row flex-wrap gap-3 mb-4">
                {presetColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setGroupBrandColor(color)}
                    className="rounded-2xl border-2"
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: color,
                      borderColor: groupBrandColor === color ? '#ffffff' : 'rgba(255,255,255,0.1)',
                      borderWidth: groupBrandColor === color ? 3 : 2,
                    }}
                  >
                    {groupBrandColor === color && (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="checkmark" size={28} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

            </View>

            {/* Group Logo */}
            <View className="mb-6">
              <Text className="text-white text-base mb-2">Group Logo</Text>
              <View className="flex-row items-center gap-4">
                {groupLogo && (
                  <Image
                    source={{ uri: groupLogo }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    className="border-2 border-white/10"
                  />
                )}
                <TouchableOpacity
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-row items-center justify-center"
                  onPress={handlePickGroupLogo}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color="white" />
                  <Text className="text-white text-base ml-2">
                    {groupLogo ? 'Change Logo' : 'Upload Logo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Members */}
            <View className="mb-6">
              <Text className="text-white text-base mb-2">Total Members *</Text>
              <TextInput
                value={totalMembers}
                onChangeText={setTotalMembers}
                placeholder="e.g., 50"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="number-pad"
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
              />
              <Text className="text-white/40 text-xs mt-2">
                Set the maximum number of members for your group
              </Text>
            </View>

            {/* Inception Date */}
            <View className="mb-8">
              <Text className="text-white text-base mb-2">Inception Date</Text>
              <TextInput
                value={inceptionDate}
                onChangeText={setInceptionDate}
                placeholder="e.g., January 2025"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
              />
              <Text className="text-white/40 text-xs mt-2">
                When was your group founded?
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveGroup}
              disabled={isSavingGroup}
              className="rounded-3xl py-5 items-center mb-6"
              style={{ backgroundColor: isSavingGroup ? '#00c2ff80' : '#00c2ff' }}
            >
              {isSavingGroup ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text className="text-black font-bold text-lg">
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}