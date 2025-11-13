import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface MessagesTabProps {
  challengeId: string;
}

interface Message {
  id: string;
  type: 'announcement' | 'milestone' | 'update';
  from: {
    name: string;
    avatar: string;
    role: string;
  };
  message: string;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: 'm1',
    type: 'announcement',
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'Great work everyone! We\'re halfway through the challenge. Keep pushing and stay consistent! 💪',
    timestamp: '2 hours ago',
  },
  {
    id: 'm2',
    type: 'milestone',
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: '🎉 Team Milestone: 500 total ability points earned! Amazing progress team!',
    timestamp: '1 day ago',
  },
  {
    id: 'm3',
    type: 'announcement',
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'Reminder: Don\'t forget to log your meals today. Nutrition is a key part of this challenge!',
    timestamp: '2 days ago',
  },
  {
    id: 'm4',
    type: 'update',
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'New task added for Week 3: Added "10 minutes stretching" to help with recovery.',
    timestamp: '3 days ago',
  },
  {
    id: 'm5',
    type: 'announcement',
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'Welcome to the 30-Day Fitness Challenge! Let\'s build healthy habits together. Remember to complete your daily tasks and support each other!',
    timestamp: '15 days ago',
  },
];

export function MessagesTab({ challengeId }: MessagesTabProps) {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Ionicons name="trophy" size={20} color="#f59e0b" />;
      case 'update':
        return <Ionicons name="alert-circle" size={20} color="#3b82f6" />;
      default:
        return <Ionicons name="megaphone" size={20} color="#00c2ff" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'milestone':
        return { backgroundColor: '#fef3c7', borderColor: '#fbbf24' };
      case 'update':
        return { backgroundColor: '#dbeafe', borderColor: '#60a5fa' };
      default:
        return { backgroundColor: '#e0f7ff', borderColor: '#a0e0ff' };
    }
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-4 space-y-6 pb-24">
        {/* Info Alert */}
        <View className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex-row gap-3">
          <Ionicons name="information-circle" size={20} color="#2563eb" />
          <Text className="text-blue-900 text-sm flex-1">
            Messages from the challenge owner will appear here. This is a one-way communication channel.
          </Text>
        </View>

        {/* Messages List */}
        <View>
          <Text className="text-white text-lg font-bold mb-4">Messages from Admin</Text>

          {mockMessages.length > 0 ? (
            <View className="space-y-4">
              {mockMessages.map((message) => (
                <View
                  key={message.id}
                  className="rounded-xl p-4 border-2"
                  style={getMessageStyle(message.type)}
                >
                  <View className="flex-row gap-3">
                    <View className="flex-shrink-0 mt-1">
                      {getMessageIcon(message.type)}
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <Image
                          source={{ uri: message.from.avatar }}
                          style={{ width: 32, height: 32, borderRadius: 16 }}
                        />
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Text className="text-slate-900 font-bold">{message.from.name}</Text>
                          <View className="bg-white/80 px-2 py-1 rounded-full">
                            <Text className="text-slate-600 text-xs font-bold">{message.from.role}</Text>
                          </View>
                        </View>
                      </View>

                      <Text className="text-slate-700 mb-2">{message.message}</Text>

                      <Text className="text-slate-500 text-xs">{message.timestamp}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-12">
              <Ionicons name="chatbox-outline" size={64} color="rgba(255,255,255,0.2)" />
              <Text className="text-white text-lg font-bold mt-4 mb-2">No messages yet</Text>
              <Text className="text-white/60 text-sm text-center">
                The challenge owner hasn't posted any messages yet. Check back later!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
