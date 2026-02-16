import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'Personal' | 'Group';
  progress: number;
  daysCompleted: number;
  totalDays: number;
  currentStreak: number;
  members: number;
  status: 'active' | 'completed';
  endDate: string;
  isJoined?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: (challengeId: string) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Account for padding (16*2) and gap (16)

export function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = challenge.image && !imageError;

  // Type badge colors
  const getTypeBadgeColor = () => {
    switch (challenge.type) {
      case 'Personal':
        return '#a855f7'; // Purple
      case 'Group':
        return '#00c2ff'; // Cyan
      default:
        return '#00c2ff';
    }
  };

  // Progress bar color
  const getProgressColor = () => {
    return challenge.status === 'completed' ? '#10b981' : '#00c2ff';
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(challenge.id)}
      className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 w-full"
      
      activeOpacity={0.8}
    >
      {/* Image Header */}
      <View style={{ height: 160 }} className="relative">
        {showImage ? (
          <Image
            source={{ uri: challenge.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full bg-white/10 items-center justify-center">
            <Ionicons name="trophy-outline" size={48} color="rgba(255,255,255,0.3)" />
          </View>
        )}
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.5, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Badges on Image */}
        <View style={{ position: 'absolute', top: 12, left: 12, right: 12 }} className="flex-row items-start justify-between">
          {/* Type Badge */}
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${getTypeBadgeColor()}40` }}
          >
            <Text className="text-white text-xs font-semibold">{challenge.type}</Text>
          </View>

          {/* Members Count */}
          {challenge.members > 1 && (
            <View className="flex-row items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-2 py-1">
              <Ionicons name="people" size={12} color="white" />
              <Text className="text-white text-xs font-medium">{challenge.members}</Text>
            </View>
          )}
        </View>

        {/* Title & Description Overlay */}
        <View style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <Text className="text-white font-bold text-sm mb-1" numberOfLines={2}>
            {challenge.title}
          </Text>
          <Text className="text-white/70 text-xs" numberOfLines={1}>
            {challenge.description}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Progress Section */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/60 text-xs">Progress</Text>
            <Text className="text-white text-xs font-medium">
              {challenge.daysCompleted}/{challenge.totalDays}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${challenge.progress}%`,
                backgroundColor: getProgressColor(),
              }}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between mb-2">
          {/* Streak */}
          {challenge.currentStreak > 0 ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="flame" size={14} color="#f97316" />
              <Text className="text-white/80 text-xs">{challenge.currentStreak}d</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.4)" />
              <Text className="text-white/60 text-xs">No streak</Text>
            </View>
          )}

          {/* End Date */}
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-[10px]">{challenge.endDate}</Text>
          </View>
        </View>

        {/* Completed Badge or Join/View Button */}
        {challenge.status === 'completed' ? (
          <View className="pt-2 border-t border-white/10">
            <View className="flex-row items-center justify-center gap-1.5 py-1">
              <View
                className="w-4 h-4 rounded-full items-center justify-center"
                style={{ backgroundColor: '#10b98120' }}
              >
                <Ionicons name="checkmark" size={12} color="#10b981" />
              </View>
              <Text className="text-xs font-medium" style={{ color: '#10b981' }}>
                Completed
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onPress(challenge.id)}
            className="pt-2 border-t border-white/10"
            activeOpacity={0.7}
          >
            <View
              className="py-1 rounded-lg items-center"
              style={{ backgroundColor: challenge.isJoined ? 'transparent' : '#00c2ff20' }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: challenge.isJoined ? '#00c2ff' : '#00c2ff' }}
              >
                {challenge.isJoined ? 'View' : 'Join'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
