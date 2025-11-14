import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from './PostCard';

interface GivePointsModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  onConfirm: (points: number) => void;
}

const pointOptions = [1, 3, 5, 10, 15];

export function GivePointsModal({ visible, onClose, post, onConfirm }: GivePointsModalProps) {
  const [selectedPoints, setSelectedPoints] = useState(5);

  if (!post) return null;

  const handleConfirm = () => {
    onConfirm(selectedPoints);
    Alert.alert(
      'Points Given!',
      `You gave ${selectedPoints} ability points to ${post.user.name}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

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
            <View>
              <Text className="text-white text-xl font-bold">Give Ability Points</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 p-6">
          {/* User Info Card */}
          <View className="flex-row items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
            <View className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                source={{ uri: post.user.avatar }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            
            <View className="flex-1">
              <Text className="text-white font-bold">{post.user.name}</Text>
              <Text className="text-white/60 text-sm">{post.challenge.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View className="bg-white/10 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs">{post.user.streak}🔥 Streak</Text>
                </View>
                <View
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: '#00c2ff20' }}
                >
                  <Text className="text-xs" style={{ color: '#00c2ff' }}>
                    {post.user.abilityPoints} AP
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text className="text-white/60 text-sm">
                Reward {post.user.name} for their achievement, we believe people should be rewarded for their efforts, so every week you will get 15 ability points to give to firends and team members.
              </Text>
          {/* Points Selection */}
          <View className="mb-6">
            <Text className="text-white/60 text-sm mb-3">Select Points to Give</Text>
            <View className="flex-row gap-2">
              {pointOptions.map((points) => (
                <TouchableOpacity
                  key={points}
                  onPress={() => setSelectedPoints(points)}
                  className="flex-1 py-4 rounded-xl items-center border-2"
                  style={{
                    borderColor: selectedPoints === points ? '#00c2ff' : 'rgba(255,255,255,0.2)',
                    backgroundColor:
                      selectedPoints === points ? '#00c2ff20' : 'rgba(255,255,255,0.05)',
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className="font-bold"
                    style={{ color: selectedPoints === points ? '#00c2ff' : 'white' }}
                  >
                    {points}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View
            className="p-4 rounded-xl border mb-6"
            style={{ backgroundColor: '#00c2ff20', borderColor: '#00c2ff40' }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white/60 text-sm">Points to give:</Text>
              <View className="flex-row items-center gap-2">
                <Ionicons name="trophy" size={20} color="#00c2ff" />
                <Text className="font-bold" style={{ color: '#00c2ff' }}>
                  +{selectedPoints} AP
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            className="rounded-xl py-4 items-center"
            style={{ backgroundColor: '#00c2ff' }}
            activeOpacity={0.8}
          >
            <Text className="text-black text-lg font-bold">Confirm & Give Points</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
