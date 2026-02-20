import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '@/components';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from '@/context';
import { useProfile } from '@/hooks';
import { profileService } from '@/services';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

const profileFormSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const ProfileEdit = () => {
  const { t } = useTranslation();
  const { user, updateProfile: updateAuthProfile } = useSession();
  const { profile, refetch: refetchProfile } = useProfile();

  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

  const currentAvatarUrl =
    avatarUri ||
    profile?.avatar_url ||
    user?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    null;

  const { control, handleSubmit } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName:
        profile?.display_name ||
        user?.user_metadata?.display_name ||
        '',
      bio: profile?.bio || '',
    },
    mode: 'onBlur',
  });

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
    }
  };

  const handleUpdateProfile = handleSubmit(async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      // 1. Upload new avatar if one was picked
      let newAvatarUrl: string | undefined;
      if (avatarUri) {
        setIsUploadingAvatar(true);
        try {
          newAvatarUrl = await profileService.uploadAvatar(avatarUri);
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // 2. Update profiles table (display_name, bio, avatar_url)
      const profileUpdates: Record<string, string | undefined> = {
        display_name: data.displayName,
        bio: data.bio || '',
      };
      if (newAvatarUrl) {
        profileUpdates.avatar_url = newAvatarUrl;
      }

      await profileService.updateProfile(profileUpdates);

      // 3. Sync display_name to auth user metadata
      await updateAuthProfile({
        display_name: data.displayName,
      });

      // 4. Refetch profile to update the profile page
      await refetchProfile();

      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with back button */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white text-base ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1 text-center mr-12">Edit Profile</Text>
      </View>

      <ScrollView className='flex-1'>
        <View className='p-6'>
          {/* Avatar Section */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={handlePickAvatar} className="relative">
              {currentAvatarUrl ? (
                <Image
                  source={{ uri: currentAvatarUrl }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <View
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  className="bg-white/10 items-center justify-center"
                >
                  <Ionicons name="person" size={40} color="rgba(255,255,255,0.4)" />
                </View>
              )}
              {isUploadingAvatar ? (
                <View
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-black"
                  style={{ backgroundColor: '#00c2ff' }}
                >
                  <ActivityIndicator size="small" color="black" />
                </View>
              ) : (
                <View
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-black"
                  style={{ backgroundColor: '#00c2ff' }}
                >
                  <Ionicons name="camera" size={16} color="black" />
                </View>
              )}
            </TouchableOpacity>
            <Text className="text-white/60 text-sm mt-3">Tap to change photo</Text>
          </View>

          {/* Display Name */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Display Name</Text>
            <FormInput
              name='displayName'
              control={control}
              placeholder={t('enterYourDisplayName')}
              textInputProps={{
                placeholderTextColor: 'rgba(255,255,255,0.4)',
                style: {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                },
              }}
            />
          </View>

          {/* Bio */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Bio</Text>
            <FormInput
              name='bio'
              control={control}
              placeholder="Tell us about yourself..."
              textInputProps={{
                multiline: true,
                numberOfLines: 3,
                placeholderTextColor: 'rgba(255,255,255,0.4)',
                style: {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  height: 80,
                  textAlignVertical: 'top',
                  paddingTop: 12,
                },
              }}
            />
          </View>

          {/* Email (read-only) */}
          <View className="mb-6">
            <Text className="text-white text-sm mb-2">Email</Text>
            <View
              className="h-12 w-full px-4 rounded-2xl mb-2 justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
              }}
            >
              <Text className="text-white/40">{user?.email || ''}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={isLoading}
            className="rounded-xl py-4 items-center mt-4"
            style={{ backgroundColor: isLoading ? '#00a0d0' : '#00c2ff' }}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black font-bold text-lg">{t('updateProfile')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileEdit;
