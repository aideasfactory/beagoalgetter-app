import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateChallenge } from '@/hooks/useCreateChallenge';
import { useMyGroups } from '@/hooks/useMyGroups';

interface Step1BasicsProps {
  data: {
    title: string;
    description: string;
    duration: string;
    durationType: 'days' | 'weeks';
    startDate: Date;
    challengeType: 'personal' | 'group';
    selectedGroup: string | null;
    image: string | null;
  };
  onUpdate: (updates: Partial<Step1BasicsProps['data']>) => void;
  onImageUploaded?: (imageUrl: string) => void;
}

export function Step1Basics({ data, onUpdate, onImageUploaded }: Step1BasicsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { uploadChallengeImage, isUploading } = useCreateChallenge();
  const { groups, loading: groupsLoading } = useMyGroups();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      onUpdate({ image: localUri });

      // Upload to Supabase storage in background
      try {
        const publicUrl = await uploadChallengeImage(localUri);
        onImageUploaded?.(publicUrl);
      } catch (error: any) {
        Alert.alert('Upload Failed', error?.message || 'Could not upload image. You can try again or continue without an image.');
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      onUpdate({ startDate: selectedDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-6" showsVerticalScrollIndicator={false}>

      {/* Image Upload */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Challenge Image</Text>
        {data.image ? (
          <View className="relative">
            <Image
              source={{ uri: data.image }}
              style={{ width: '100%', height: 200, borderRadius: 12 }}
              contentFit="cover"
            />
            {isUploading && (
              <View className="absolute inset-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <ActivityIndicator size="large" color="#00c2ff" />
                <Text className="text-white text-sm mt-2">Uploading...</Text>
              </View>
            )}
            {!isUploading && (
              <TouchableOpacity
                onPress={() => {
                  onUpdate({ image: null });
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleImagePick}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 items-center"
          >
            <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.4)" />
            <Text className="text-white/60 mt-3">Tap to upload image</Text>
            <Text className="text-white/40 text-xs mt-1">Recommended: 16:9 aspect ratio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Challenge Title *</Text>
        <TextInput
          value={data.title}
          onChangeText={(text) => onUpdate({ title: text })}
          placeholder="e.g., 30-Day Fitness Challenge"
          placeholderTextColor="rgba(255,255,255,0.4)"
          className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
        />
      </View>

      {/* Description */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Description *</Text>
        <TextInput
          value={data.description}
          onChangeText={(text) => onUpdate({ description: text })}
          placeholder="Describe your challenge goals and what participants will do..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          multiline
          numberOfLines={4}
          className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[100px]"
          style={{ textAlignVertical: 'top' }}
        />
      </View>

      {/* Duration */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Duration *</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={data.duration}
            onChangeText={(text) => onUpdate({ duration: text })}
            placeholder="30"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="numeric"
            className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
          />
          <View className="flex-row bg-white/5 border border-white/20 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={() => onUpdate({ durationType: 'days' })}
              className="px-6 py-3"
              style={{ backgroundColor: data.durationType === 'days' ? '#00c2ff' : 'transparent' }}
            >
              <Text className={data.durationType === 'days' ? 'text-black font-bold' : 'text-white/60'}>
                Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onUpdate({ durationType: 'weeks' })}
              className="px-6 py-3"
              style={{ backgroundColor: data.durationType === 'weeks' ? '#00c2ff' : 'transparent' }}
            >
              <Text className={data.durationType === 'weeks' ? 'text-black font-bold' : 'text-white/60'}>
                Weeks
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Start Date */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Start Date *</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="calendar-outline" size={20} color="rgba(255,255,255,0.6)" />
            <Text className="text-white">{formatDate(data.startDate)}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={data.startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            textColor="white"
            themeVariant="dark"
          />
        )}
        
        {Platform.OS === 'ios' && showDatePicker && (
          <View className="mt-2 flex-row justify-end">
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#00c2ff' }}
            >
              <Text className="text-black font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Challenge Type */}
      <View className="mb-6">
        <Text className="text-white mb-2 font-medium">Challenge Type *</Text>
        <View className="flex-row gap-3">
          {/* Personal */}
          <TouchableOpacity
            onPress={() => onUpdate({ challengeType: 'personal', selectedGroup: null })}
            className="flex-1 py-4 rounded-xl border"
            style={{
              backgroundColor: data.challengeType === 'personal' ? 'transparent' : 'transparent',
              borderColor: data.challengeType === 'personal' ? '#00c2ff' : 'rgba(255,255,255,0.2)',
              borderWidth: 2,
            }}
          >
            <Text className={`text-center font-bold ${data.challengeType === 'personal' ? 'text-white' : 'text-white/60'}`}>
              Personal
            </Text>
          </TouchableOpacity>

          {/* Group */}
          <TouchableOpacity
            onPress={() => onUpdate({ challengeType: 'group' })}
            className="flex-1 py-4 rounded-xl border"
            style={{
              backgroundColor: data.challengeType === 'group' ? 'transparent' : 'transparent',
              borderColor: data.challengeType === 'group' ? '#00c2ff' : 'rgba(255,255,255,0.2)',
              borderWidth: 2,
            }}
          >
            <Text className={`text-center font-bold ${data.challengeType === 'group' ? 'text-white' : 'text-white/60'}`}>
              Group
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Group Selector (if Group type) */}
      {data.challengeType === 'group' && (
        <View className="mb-6">
          <Text className="text-white mb-2 font-medium">Select Group *</Text>
          {groupsLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#00c2ff" />
            </View>
          ) : groups.length === 0 ? (
            <View className="p-4 rounded-xl border border-white/10 bg-white/5">
              <Text className="text-white/60 text-center">
                You haven't created any groups yet. Go to your Profile to create one.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => onUpdate({ selectedGroup: group.id })}
                  className="flex-row items-center justify-between p-4 rounded-xl border"
                  style={{
                    backgroundColor: data.selectedGroup === group.id ? '#00c2ff20' : 'rgba(255,255,255,0.05)',
                    borderColor: data.selectedGroup === group.id ? '#00c2ff' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    {group.logo ? (
                      <Image
                        source={{ uri: group.logo }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: group.color || '#00c2ff' }}
                      >
                        <Text className="text-black font-bold">{group.name.substring(0, 2)}</Text>
                      </View>
                    )}
                    <View>
                      <Text className="text-white font-bold">{group.name}</Text>
                      <Text className="text-white/60 text-xs">{group.member_count} members</Text>
                    </View>
                  </View>
                  {data.selectedGroup === group.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#00c2ff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
