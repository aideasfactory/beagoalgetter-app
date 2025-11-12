import { useSession } from '@/context';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

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
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
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

  // Mock stats data - will be replaced with real data from Supabase
  const userProfile = {
    currentStreak: 15,
    longestStreak: 45,
    completedChallenges: 9,
    totalChallenges: 12,
    activeChallenges: 3,
    totalPoints: 2450,
  };

  const badges = [
    { id: 1, name: 'First\nChallenge', icon: '🎯', earned: true, color: '#1e3a5f' },
    { id: 2, name: '7 Day Streak', icon: '🔥', earned: true, color: '#5f1e1e' },
    { id: 3, name: '30 Day\nStreak', icon: '💪', earned: true, color: '#3a5f1e' },
    { id: 4, name: 'Team Player', icon: '🤝', earned: true, color: '#4a1e5f' },
    { id: 5, name: '100 Day\nStreak', icon: '🏆', earned: false, color: '#2a2a2a' },
    { id: 6, name: 'Perfect\nMonth', icon: '⭐', earned: false, color: '#2a2a2a' },
  ];

  const socialConnections = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', connected: true, gradient: ['#833ab4', '#fd1d1d'] },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', connected: false, gradient: ['#1da1f2', '#1da1f2'] },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', connected: false, gradient: ['#1877f2', '#1877f2'] },
  ];

  // Default avatar if none provided
  const avatarUrl = user?.avatar_url || user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default';
  const displayName = user?.user_metadata?.display_name || user?.full_name || 'Sarah Johnson';
  const username = user?.user_metadata?.username || '@sarahj';
  const bio = user?.user_metadata?.bio || 'Fitness enthusiast | Building consistency one day at a time 💪';

  const handleCreateGroup = () => {
    if (!groupName || !groupDescription || !totalMembers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    Alert.alert('Success', `${groupName} group created successfully!`);
    setGroupName('');
    setGroupDescription('');
    setGroupBrandColor('#00c2ff');
    setGroupLogo(null);
    setTotalMembers('');
    setInceptionDate('');
    setIsCreateGroupOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="items-center py-8">
          <TouchableOpacity className="relative">
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
        </View>

        {/* Circular Progress Stats */}
        <View className="px-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Your Progress</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 items-center">
              <CircularProgress
                value={userProfile.currentStreak}
                max={userProfile.longestStreak}
                color="#00c2ff"
                label="Current Streak"
                sublabel="days"
              />
            </View>
            <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 items-center">
              <CircularProgress
                value={userProfile.completedChallenges}
                max={userProfile.totalChallenges}
                color="#84cc16"
                label="Completed"
                sublabel={`of ${userProfile.totalChallenges}`}
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
                {userProfile.longestStreak}
              </Text>
              <Text className="text-white/60 text-sm">Longest Streak</Text>
            </View>

            {/* Total Points */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#3a5f1e' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#84cc16' }}>
                <Ionicons name="medal" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#84cc16' }}>
                {userProfile.totalPoints}
              </Text>
              <Text className="text-white/60 text-sm">Total Points</Text>
            </View>

            {/* Active Now */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#4a1e5f' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#a855f7' }}>
                <Ionicons name="radio-button-on" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#a855f7' }}>
                {userProfile.activeChallenges}
              </Text>
              <Text className="text-white/60 text-sm">Active Now</Text>
            </View>

            {/* Total Challenges */}
            <View className="flex-1 min-w-[45%] rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#5f3a1e' }}>
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#f97316' }}>
                <Ionicons name="trophy" size={24} color="black" />
              </View>
              <Text className="text-4xl font-bold mb-1" style={{ color: '#f97316' }}>
                {userProfile.totalChallenges}
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
                  Start your own fitness community and challenge friends together
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsCreateGroupOpen(true)}
              className="rounded-xl py-4 items-center flex-row justify-center"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Ionicons name="add" size={24} color="black" />
              <Text className="text-black font-bold text-lg ml-2">Create New Group</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Connections */}
        <View className="px-4 mb-8">
          <Text className="text-white text-xl font-bold mb-4">Social Connections</Text>
          <View className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/10">
            <Text className="text-white/60 text-sm mb-4">
              Connect your social media accounts to automatically share your achievements
            </Text>

            {socialConnections.map((social) => (
              <View
                key={social.id}
                className="flex-row items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 mb-3"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-12 h-12 rounded-lg items-center justify-center"
                    style={{
                      backgroundColor: social.gradient[0],
                    }}
                  >
                    <Ionicons name={social.icon as any} size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-medium">{social.name}</Text>
                    <Text className="text-white/40 text-xs">
                      {social.connected ? 'Connected' : 'Not connected'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: social.connected ? 'transparent' : '#00c2ff',
                    borderWidth: social.connected ? 1 : 0,
                    borderColor: social.connected ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }}
                >
                  <Text
                    className="font-medium"
                    style={{ color: social.connected ? 'white' : 'black' }}
                  >
                    {social.connected ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
        onRequestClose={() => setIsCreateGroupOpen(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-[#1a1a1a]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
            <View style={{ width: 28 }} />
            <Text className="text-white text-xl font-bold">Create New Group</Text>
            <TouchableOpacity onPress={() => setIsCreateGroupOpen(false)}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={true}
          >
            <Text className="text-white/60 text-sm text-center mb-8">
              Fill in the details to create your own fitness group
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
                  onPress={() => {
                    Alert.alert('Image Picker', 'Image picker would be implemented with expo-image-picker');
                  }}
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

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreateGroup}
              className="rounded-3xl py-5 items-center mb-6"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Text className="text-black font-bold text-lg">Create Group</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}