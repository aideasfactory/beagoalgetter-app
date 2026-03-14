import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge } from './ChallengeCard';
import { IconCircle } from './IconCircle';

interface JoinChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  onJoin: (challengeId: string) => void;
}

interface JoinChallengeContentProps {
  challenge: Challenge;
  onClose: () => void;
  onJoin: (challengeId: string) => void;
}

export function JoinChallengeContent({ challenge, onClose, onJoin }: JoinChallengeContentProps) {
  if (!challenge) return null;

  const handleJoin = () => {
    onJoin(challenge.id);
    onClose();
  };

  const getTypeBadgeColor = () => {
    switch (challenge.type) {
      case 'Personal':
        return '#a855f7';
      case 'Group':
        return '#00c2ff';
      default:
        return '#00c2ff';
    }
  };

  return (
    <View className="flex-1 bg-black">
        {/* Header with Image */}
        <View style={{ height: 300 }} className="relative">
          <Image
            source={{ uri: challenge.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000000']}
            locations={[0, 0.7, 1]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-12 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Challenge Info Overlay */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} className="p-6">
            <View
              className="px-3 py-1.5 rounded-full self-start mb-3"
              style={{ backgroundColor: `${getTypeBadgeColor()}40` }}
            >
              <Text className="text-white text-xs font-bold">{challenge.type} Challenge</Text>
            </View>
            <Text className="text-white text-3xl font-bold tracking-tight mb-2">{challenge.title}</Text>
            <Text className="text-white/70 text-base">{challenge.description}</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          {/* Stats Grid */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Challenge Details</Text>
            <View className="flex-row flex-wrap gap-3">
              {/* Duration */}
              <View className="flex-1 min-w-[45%] bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <View className="mb-2">
                  <IconCircle icon="calendar" size="lg" variant="tint" />
                </View>
                <Text className="text-white text-2xl font-bold">{challenge.totalDays}</Text>
                <Text className="text-white/60 text-sm">Days</Text>
              </View>

              {/* Members */}
              <View className="flex-1 min-w-[45%] bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <View className="mb-2">
                  <IconCircle icon="people" size="lg" variant="tint" color="#a855f7" />
                </View>
                <Text className="text-white text-2xl font-bold">{challenge.members}</Text>
                <Text className="text-white/60 text-sm">{challenge.members === 1 ? 'Member' : 'Members'}</Text>
              </View>

              {/* Status */}
              <View className="flex-1 min-w-[45%] bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <View className="mb-2">
                  <IconCircle icon="checkmark-circle" size="lg" variant="tint" color="#10b981" />
                </View>
                <Text className="text-white text-2xl font-bold">{Math.round(challenge.progress)}%</Text>
                <Text className="text-white/60 text-sm">Completion</Text>
              </View>

              {/* End Date */}
              <View className="flex-1 min-w-[45%] bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <View className="mb-2">
                  <IconCircle icon="time" size="lg" variant="tint" color="#f97316" />
                </View>
                <Text className="text-white text-lg font-bold">{challenge.endDate}</Text>
                <Text className="text-white/60 text-sm">Ends</Text>
              </View>
            </View>
          </View>

          {/* What You'll Get */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">What You’ll Get</Text>
            <View className="space-y-3">
              <View className="flex-row items-start gap-3">
                <IconCircle icon="checkmark" size="sm" variant="tint" />
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">Daily Task Tracking</Text>
                  <Text className="text-white/60 text-sm">Keep track of your progress with daily tasks and streaks</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <IconCircle icon="checkmark" size="sm" variant="tint" />
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">Compete & Collaborate</Text>
                  <Text className="text-white/60 text-sm">Join the leaderboard and see how you stack up</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <IconCircle icon="checkmark" size="sm" variant="tint" />
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">Earn Ability Points</Text>
                  <Text className="text-white/60 text-sm">Complete tasks to earn points and level up</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <IconCircle icon="checkmark" size="sm" variant="tint" />
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">Stay Accountable</Text>
                  <Text className="text-white/60 text-sm">Share progress with others and stay motivated</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Community Info (for Group challenges) */}
          {challenge.type === 'Group' && (
            <View className="mb-12">
              <Text className="text-white text-lg font-bold mb-4">Community</Text>
              <View className="bg-white/5 border border-white/10 rounded-xl p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <IconCircle icon="people" size="lg" variant="solid" />
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{challenge.members} Active Members</Text>
                    <Text className="text-white/60 text-sm">Join the community today</Text>
                  </View>
                </View>
                <Text className="text-white/70 text-sm">
                  Connect with others on the same journey. Share progress, give encouragement, and achieve your goals together.
                </Text>
              </View>
            </View>
          )}

          {/* Spacing for bottom button */}
          <View style={{ height: 150 }} />
        </ScrollView>

        {/* Fixed Bottom Join Button */}
        <View className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10" style={{ backgroundColor: '#000000' }}>
          <TouchableOpacity
            onPress={handleJoin}
            className="w-full py-4 rounded-xl items-center flex-row justify-center gap-2"
            style={{ backgroundColor: '#00c2ff' }}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color="black" />
            <Text className="text-black font-bold text-lg">Join Challenge</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onClose}
            className="w-full py-3 mt-3 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white/60">Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

export function JoinChallengeModal({ visible, onClose, challenge, onJoin }: JoinChallengeModalProps) {
  if (!challenge) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <JoinChallengeContent challenge={challenge} onClose={onClose} onJoin={onJoin} />
    </Modal>
  );
}
