import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

interface Step3ShareLinkProps {
  challengeId: string | null;
  joinCode: string | null;
  challengeTitle: string;
  isLoading?: boolean;
  onPublish: () => void;
  onDone: () => void;
}

export function Step3ShareLink({ challengeId, joinCode, challengeTitle, isLoading, onPublish, onDone }: Step3ShareLinkProps) {
  const scrollRef = useRef<ScrollView>(null);
  const isPublished = !!challengeId;
  const shareUrl = `https://beagoalgetter.app/join/${joinCode}`;

  // Scroll to top when switching to success view
  useEffect(() => {
    if (isPublished) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isPublished]);

  const handlePublish = () => {
    if (isLoading) return;
    onPublish();
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied!', 'Challenge link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my challenge "${challengeTitle}"!\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Pre-publish view
  if (!isPublished) {
    return (
      <ScrollView ref={scrollRef} className="flex-1 bg-black px-6 py-6">
        {/* Header */}
        <View className="mb-8">
          <View className="w-16 h-16 rounded-full bg-cyan-500/20 items-center justify-center mb-4">
            <Ionicons name="rocket-outline" size={32} color="#00c2ff" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            Ready to Publish?
          </Text>
          <Text className="text-white/60 text-base">
            Once published, your challenge will be live and you&apos;ll get a shareable link to invite participants.
          </Text>
        </View>

        {/* What Happens Next Card */}
        <View className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <Text className="text-white font-bold text-lg mb-4">What Happens Next</Text>
          <View className="gap-4">
            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-cyan-500/20 items-center justify-center mt-0.5">
                <Ionicons name="checkmark-circle" size={20} color="#00c2ff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">Challenge Goes Live</Text>
                <Text className="text-white/60 text-sm">
                  Your challenge will be published to your selected group
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-cyan-500/20 items-center justify-center mt-0.5">
                <Ionicons name="link" size={20} color="#00c2ff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">Get Shareable Link</Text>
                <Text className="text-white/60 text-sm">
                  You&apos;ll receive a unique link to share with anyone
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-cyan-500/20 items-center justify-center mt-0.5">
                <Ionicons name="people" size={20} color="#00c2ff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">Start Inviting</Text>
                <Text className="text-white/60 text-sm">
                  Share via WhatsApp, Instagram, or any messaging app
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-cyan-500/20 items-center justify-center mt-0.5">
                <Ionicons name="play" size={20} color="#00c2ff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">Challenge Begins</Text>
                <Text className="text-white/60 text-sm">
                  Members can join and start completing daily tasks
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Challenge Summary */}
        <View className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <Text className="text-white/60 text-sm mb-2">Challenge Name</Text>
          <Text className="text-white font-bold text-lg mb-4">{challengeTitle}</Text>

          <View className="flex-row items-center gap-2">
            <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-sm flex-1">
              You can edit challenge details anytime from the challenge settings
            </Text>
          </View>
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          onPress={handlePublish}
          disabled={isLoading}
          className="py-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: isLoading ? 'rgba(0,194,255,0.5)' : '#00c2ff' }}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="black" />
              <Text className="text-black font-bold text-lg">Publishing...</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="rocket" size={20} color="black" />
              <Text className="text-black font-bold text-lg">Publish Challenge</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Note */}
        <View className="items-center">
          <Text className="text-white/40 text-xs text-center">
            By publishing, you agree to make this challenge visible to your group
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Post-publish view (share link)
  return (
    <ScrollView ref={scrollRef} className="flex-1 bg-black px-6 py-6">
      {/* Success Header */}
      <View className="mb-8 items-center">
        <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={48} color="#10b981" />
        </View>
        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Challenge Published!
        </Text>
        <Text className="text-white/60 text-base text-center">
          Your challenge is now live. Share the link below to invite participants.
        </Text>
      </View>

      {/* Share Link Card */}
      <View className="mb-6">
        <LinearGradient
          colors={['rgba(0, 194, 255, 0.1)', 'rgba(0, 194, 255, 0.05)']}
          className="rounded-2xl p-6 border border-cyan-500/30"
        >
          <Text className="text-white/60 text-sm mb-3">Challenge Link</Text>
          <View className="bg-black/50 rounded-xl p-4 mb-4">
            <Text
              className="text-cyan-500 text-base"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {shareUrl}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCopyLink}
              className="flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Ionicons name="copy-outline" size={20} color="black" />
              <Text className="text-black font-bold">Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text className="text-white font-bold">Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* View Challenge Button */}
      <TouchableOpacity
        onPress={onDone}
        className="py-4 rounded-xl items-center mb-4 border border-white/20"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="eye-outline" size={20} color="white" />
          <Text className="text-white font-bold text-lg">View Challenge</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
