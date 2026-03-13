import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ImageViewer } from './ImageViewer';
import { getReactionConfig } from '@/utils/reactionConfig';

export interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    streak: number;
    abilityPoints: number;
  };
  challenge: {
    id: string;
    name: string;
    type: 'Personal' | 'Group';
    members: number;
  };
  challengeDay?: {
    current: number;
    total: number;
  };
  group?: {
    name: string;
    logo: string;
    color: string;
  };
  type: 'success' | 'fail' | 'joined';
  isChallengeComplete?: boolean;
  message: string;
  note?: string;
  image?: string;
  timestamp: string;
  likes: number;
  abilityPointsGiven: number;
  isLiked?: boolean;
  isOwnPost?: boolean;
}

interface PostCardProps {
  post: Post;
  onChallengeClick: (challengeId: string) => void;
  onGivePoints: (post: Post) => void;
  onGroupClick?: (group: NonNullable<Post['group']>) => void;
  onLike?: (postId: string, liked: boolean, reactionType?: string) => void;
}

const APP_ICON = require('@/assets/images/icon.png');

export function PostCard({ post, onChallengeClick, onGivePoints, onGroupClick, onLike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const reaction = useMemo(
    () => getReactionConfig(post.type, post.isChallengeComplete),
    [post.type, post.isChallengeComplete],
  );

  // Sync with parent state (reverts optimistic update on network failure)
  useEffect(() => { setIsLiked(post.isLiked ?? false); }, [post.isLiked]);
  useEffect(() => { setLikeCount(post.likes); }, [post.likes]);

  const avatarSource = post.user.avatar ? { uri: post.user.avatar } : APP_ICON;

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike?.(post.id, newLiked, reaction.reactionType);
  };
  return (
    <View className="rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 mb-4">
      {/* Success/Fail/Completed Ribbon - Top Right Corner */}
      <View style={styles.ribbonContainer} pointerEvents="none">
        <View
          style={[
            styles.ribbon,
            { backgroundColor: post.isChallengeComplete ? '#10b981' : post.type === 'joined' ? '#a855f7' : post.type === 'success' ? '#00c2ff' : '#ef4444' },
          ]}
        >
          <Text className="text-black text-xs font-bold uppercase tracking-wider">
            {post.isChallengeComplete ? '   Completed' : post.type === 'joined' ? '   Joined' : post.type === 'success' ? '✓ Done' : '✗ Failed'}
          </Text>
        </View>
      </View>

      {/* Group Banner (if exists) */}
      {post.group && (
        <TouchableOpacity
          onPress={() => onGroupClick?.(post.group!)}
          className="p-3 border-b border-white/10"
          style={{ backgroundColor: post.group.color }}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center overflow-hidden">
              {post.group.logo ? (
                <Image
                  source={{ uri: post.group.logo }}
                  style={{ width: 40, height: 40 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-lg font-bold" style={{ color: post.group.color }}>
                  {post.group.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-white text-xs">Challenge by</Text>
              <Text className="text-white font-bold">{post.group.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Post Content */}
      <View className="p-5">
        {/* User Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-3">
            {/* User Avatar */}
            <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
              <Image
                source={avatarSource}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>

            {/* User Info */}
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-medium">{post.user.name}</Text>
                {/* Streak Badge */}
                <View className="bg-white/10 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs">
                    {post.user.streak}🔥
                  </Text>
                </View>
              </View>

              {/* Challenge Name (clickable, underlined) + Day Indicator */}
              <TouchableOpacity onPress={() => onChallengeClick(post.challenge.id)}>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-white/60 underline">
                    {post.challenge.name}
                  </Text>
                  {post.challengeDay && (
                    <View className="bg-white/10 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-white/50">
                        Day {post.challengeDay.current} of {post.challengeDay.total}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Post Message */}
        <Text className="text-white mb-3">{post.message}</Text>

        {/* Post Note (optional) */}
        {post.note && (
          <Text className="text-sm text-white/60 italic mb-3">{post.note}</Text>
        )}

        {/* Post Image (optional) */}
        {post.image && (
          <>
            <Pressable onPress={() => setImageViewerVisible(true)}>
              <View className="rounded-xl overflow-hidden mb-3 border-2 border-white/10">
                <Image
                  source={{ uri: post.image }}
                  style={{ width: '100%', height: 256 }}
                  contentFit="cover"
                />
              </View>
            </Pressable>
            <ImageViewer
              visible={imageViewerVisible}
              imageUrl={post.image}
              onClose={() => setImageViewerVisible(false)}
            />
          </>
        )}

        {/* Post Actions */}
        <View className="flex-row items-center gap-6 pt-3 border-t border-white/10">
          {/* Reaction Button (post-type-specific) */}
          <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-2">
            <Ionicons
              name={(isLiked ? reaction.iconFilled : reaction.iconOutline) as any}
              size={20}
              color={isLiked ? reaction.activeColor : reaction.inactiveColor}
            />
            <Text className="text-white/60 text-sm">{likeCount}</Text>
          </TouchableOpacity>

          {/* Give Points Button (hidden on own posts) */}
          {!post.isOwnPost && (
            <TouchableOpacity
              onPress={() => onGivePoints(post)}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="trophy-outline" size={20} color="rgba(255,255,255,0.6)" />
              <Text className="text-white/60 text-sm">Give Points</Text>
            </TouchableOpacity>
          )}

          {/* Ability Points Indicator (if > 0) */}
          {post.abilityPointsGiven > 0 && (
            <View
              className="flex-row items-center gap-1 px-2 py-1 rounded-full"
              style={{ backgroundColor: '#00c2ff20' }}
            >
              <Ionicons name="trending-up" size={16} color="#00c2ff" />
              <Text className="text-sm" style={{ color: '#00c2ff' }}>
                +{post.abilityPointsGiven} AP
              </Text>
            </View>
          )}

          {/* Timestamp */}
          <Text className="text-xs text-white/40 ml-auto">{post.timestamp}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    zIndex: 10,
    overflow: 'hidden',
  },
  ribbon: {
    position: 'absolute',
    top: 20,
    right: -40,
    width: 160,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
