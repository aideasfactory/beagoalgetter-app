import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export interface Notification {
  id: string;
  type: 'like' | 'points' | 'challenge' | 'streak';
  user?: {
    name: string;
    avatar: string;
  };
  message: string;
  post?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export function NotificationsModal({ visible, onClose, notifications }: NotificationsModalProps) {
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
              <Text className="text-white text-xl font-bold">Notifications</Text>
              <Text className="text-white/60 text-sm">
                Stay updated with your challenges and achievements
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4 space-y-2">
            {notifications.map((notification) => (
              <View
                key={notification.id}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: notification.read ? 'rgba(255,255,255,0.05)' : '#00c2ff20',
                  borderColor: notification.read ? 'rgba(255,255,255,0.1)' : '#00c2ff40',
                }}
              >
                <View className="flex-row items-start gap-3">
                  {/* Avatar or Icon */}
                  {notification.user ? (
                    <View className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        source={{ uri: notification.user.avatar }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                  ) : (
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#00c2ff' }}
                    >
                      {notification.type === 'challenge' ? (
                        <Ionicons name="target" size={20} color="black" />
                      ) : (
                        <Ionicons name="flame" size={20} color="black" />
                      )}
                    </View>
                  )}

                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-white text-sm">
                      {notification.user && (
                        <Text className="font-medium">{notification.user.name} </Text>
                      )}
                      {notification.message}
                    </Text>
                    {notification.post && (
                      <Text className="text-white/60 text-xs mt-1 italic">
                        "{notification.post}"
                      </Text>
                    )}
                    <Text className="text-white/40 text-xs mt-2">
                      {notification.timestamp}
                    </Text>
                  </View>

                  {/* Unread Dot */}
                  {!notification.read && (
                    <View
                      className="w-2 h-2 rounded-full mt-2"
                      style={{ backgroundColor: '#00c2ff' }}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
