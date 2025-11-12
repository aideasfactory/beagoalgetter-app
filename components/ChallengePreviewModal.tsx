import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface ChallengePreview {
  id: string;
  name: string;
  type: string;
  members: number;
  duration?: string;
  completionPercentage?: number;
}

interface ChallengePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  challenge: ChallengePreview | null;
  onViewChallenge: () => void;
}

export function ChallengePreviewModal({
  visible,
  onClose,
  challenge,
  onViewChallenge,
}: ChallengePreviewModalProps) {
  if (!challenge) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-[#1a1a1a]">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white/10">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{challenge.name}</Text>
              <Text className="text-white/60 text-sm">
                {challenge.type} Challenge • {challenge.members} members
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 p-6">
          {/* Challenge Details Card */}
          <View className="rounded-xl p-6 shadow-lg mb-6" style={{ backgroundColor: '#14b8a6' }}>
            <Text className="text-white text-lg font-bold mb-2">Challenge Details</Text>
            <Text className="text-white/90 text-sm leading-relaxed">
              Join your teammates in completing daily tasks and building consistent habits. Track
              your progress, earn ability points, and celebrate wins together!
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 items-center">
              <Text className="mb-1" style={{ color: '#00c2ff' }}>
                Duration
              </Text>
              <Text className="text-white font-bold">{challenge.duration || '30 Days'}</Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 items-center">
              <Text className="mb-1" style={{ color: '#00c2ff' }}>
                Active
              </Text>
              <Text className="text-white font-bold">{challenge.members}</Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 items-center">
              <Text className="mb-1" style={{ color: '#00c2ff' }}>
                Completed
              </Text>
              <Text className="text-white font-bold">
                {challenge.completionPercentage || 45}%
              </Text>
            </View>
          </View>

          {/* View Challenge Button */}
          <TouchableOpacity
            onPress={onViewChallenge}
            className="rounded-xl py-6 items-center"
            style={{ backgroundColor: '#00c2ff' }}
            activeOpacity={0.8}
          >
            <Text className="text-black text-lg font-bold">View Challenge</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
