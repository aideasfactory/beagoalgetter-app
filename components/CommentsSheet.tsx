import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { usePostComments } from '@/hooks/usePostComments';

const APP_ICON = require('@/assets/images/icon.png');

interface CommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string | null;
  onCommentCountChange?: (postId: string, delta: number) => void;
}

function formatCommentTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export function CommentsSheet({ visible, onClose, postId, onCommentCountChange }: CommentsSheetProps) {
  const { comments, loading, submitting, currentUserId, addComment, deleteComment } =
    usePostComments(visible ? postId : null);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) {
      setText('');
    }
  }, [visible]);

  useEffect(() => {
    if (comments.length > 0 && !loading) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [comments.length, loading]);

  const handleSend = async () => {
    if (!text.trim() || submitting) return;
    const content = text;
    setText('');
    const success = await addComment(content);
    if (success) {
      if (postId) {
        onCommentCountChange?.(postId, 1);
      }
      scrollRef.current?.scrollToEnd({ animated: true });
    } else {
      setText(content);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    }
  };

  const handleDelete = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteComment(commentId);
          if (postId) {
            onCommentCountChange?.(postId, -1);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-[#1a1a1a]" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-white/10">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-xl font-bold">Comments</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Comments List */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 py-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#00c2ff" />
              </View>
            ) : comments.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Ionicons name="chatbubble-outline" size={48} color="rgba(255,255,255,0.3)" />
                <Text className="text-white/40 text-base mt-4">No comments yet</Text>
                <Text className="text-white/30 text-sm mt-1">Be the first to comment!</Text>
              </View>
            ) : (
              comments.map((comment) => {
                const isOwn = currentUserId === comment.user_id;
                const avatarSource = comment.user_avatar
                  ? { uri: comment.user_avatar }
                  : APP_ICON;

                return (
                  <View key={comment.id} className="flex-row gap-3 mb-4">
                    {/* Avatar */}
                    <View className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                      <Image
                        source={avatarSource}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>

                    {/* Comment Body */}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-white font-medium text-sm">
                          {comment.user_name || comment.user_username || 'Member'}
                        </Text>
                        <Text className="text-white/30 text-xs">
                          {formatCommentTime(comment.created_at)}
                        </Text>
                      </View>
                      <Text className="text-white/80 text-sm mt-0.5">{comment.content}</Text>

                      {isOwn && (
                        <TouchableOpacity
                          onPress={() => handleDelete(comment.id)}
                          className="mt-1 self-start"
                        >
                          <Text className="text-red-400/60 text-xs">Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input Bar */}
          <SafeAreaView edges={['bottom']} className="border-t border-white/10 bg-[#1a1a1a]">
            <View className="flex-row items-end gap-2 px-4 py-3">
              <TextInput
                className="flex-1 bg-white/10 rounded-2xl px-4 py-2.5 text-white text-sm"
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
                style={{ maxHeight: 100 }}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!text.trim() || submitting}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: text.trim() ? '#00c2ff' : 'rgba(255,255,255,0.1)',
                }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={text.trim() ? '#000' : 'rgba(255,255,255,0.3)'}
                  />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
