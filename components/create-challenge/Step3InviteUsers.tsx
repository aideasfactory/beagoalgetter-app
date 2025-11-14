import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  challenges: number;
}

interface Step3InviteUsersProps {
  data: {
    selectedUsers: string[];
  };
  onUpdate: (updates: Partial<Step3InviteUsersProps['data']>) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', streak: 15, challenges: 3 },
  { id: '2', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', streak: 8, challenges: 2 },
  { id: '3', name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', streak: 22, challenges: 5 },
  { id: '4', name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', streak: 12, challenges: 4 },
  { id: '5', name: 'Jessica Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', streak: 5, challenges: 1 },
  { id: '6', name: 'Alex Thompson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', streak: 18, challenges: 6 },
  { id: '7', name: 'Rachel Green', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel', streak: 0, challenges: 2 },
  { id: '8', name: 'Tom Anderson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', streak: 30, challenges: 8 },
  { id: '9', name: 'Lisa Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', streak: 7, challenges: 3 },
  { id: '10', name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', streak: 14, challenges: 4 },
];

export function Step3InviteUsers({ data, onUpdate }: Step3InviteUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return mockUsers;
    const query = searchQuery.toLowerCase();
    return mockUsers.filter(user =>
      user.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleUser = (userId: string) => {
    const selectedUsers = data.selectedUsers.includes(userId)
      ? data.selectedUsers.filter(id => id !== userId)
      : [...data.selectedUsers, userId];
    onUpdate({ selectedUsers });
  };

  const selectAll = () => {
    onUpdate({ selectedUsers: filteredUsers.map(u => u.id) });
  };

  const deselectAll = () => {
    onUpdate({ selectedUsers: [] });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 py-6 border-b border-white/10">
        <Text className="text-white text-xl font-bold mb-2">Invite Participants</Text>
        <Text className="text-white/60 text-sm mb-4">
          Select people to invite to your challenge
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-2 py-1 mb-3">
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-white ml-3"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </View>

      </View>

      {/* Select All */}
      <View className="px-6 py-3 border-b border-white/10">
        <TouchableOpacity
          onPress={() => {
            if (data.selectedUsers.length === filteredUsers.length) {
              deselectAll();
            } else {
              selectAll();
            }
          }}
          className="flex-row items-center p-4 rounded-xl border border-white/20"
        >
          <View
            className="w-5 h-5 rounded-md border-2 items-center justify-center mr-3"
            style={{
              backgroundColor: data.selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? '#00c2ff' : 'transparent',
              borderColor: data.selectedUsers.length > 0 ? '#00c2ff' : 'rgba(255,255,255,0.3)',
            }}
          >
            {data.selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 && (
              <Ionicons name="checkmark" size={14} color="black" />
            )}
          </View>
          <Text className="text-white font-medium">Select All ({filteredUsers.length} users)</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {filteredUsers.length > 0 ? (
          <View className="gap-2">
            {filteredUsers.map((user) => {
              const isSelected = data.selectedUsers.includes(user.id);
              return (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => toggleUser(user.id)}
                  className="flex-row items-center p-4 rounded-xl border border-white/10"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {/* Checkbox */}
                  <View
                    className="w-5 h-5 rounded-md border-2 items-center justify-center mr-3"
                    style={{
                      backgroundColor: isSelected ? '#00c2ff' : 'transparent',
                      borderColor: isSelected ? '#00c2ff' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="black" />}
                  </View>

                  {/* Avatar */}
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />

                  {/* User Info */}
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-bold">{user.name}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-white/60 text-xs">{user.streak}</Text>
                      <Ionicons name="flame" size={12} color="#f97316" />
                      <Text className="text-white/60 text-xs">streak • {user.challenges} challenges</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          // Empty State
          <View className="items-center justify-center py-12">
            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
              <Ionicons name="search" size={40} color="rgba(255,255,255,0.4)" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">No Users Found</Text>
            <Text className="text-white/60 text-center px-8">
              No users match your search "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
