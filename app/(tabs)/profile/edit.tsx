import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, FormInput } from '@/components';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from '@/context';
import { useTranslation } from 'react-i18next';

const ProfileEdit = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useSession();

  const [isLoading, setIsLoading] = React.useState(false);

  const profileFormSchema = z.object({
    displayName: z.string().min(1, 'Display name is required'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
  });

  type ProfileFormData = z.infer<typeof profileFormSchema>;

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.user_metadata?.display_name || '',
      email: user?.email || '',
    },
    mode: 'onBlur'
  });

  const handleUpdateProfile = handleSubmit(async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const profileData = {
        display_name: data.displayName,
        email: data.email,
      }

      await updateProfile(profileData);
    } catch (error) {
      console.error('Update profile failed:', error);
    } finally {
      setIsLoading(false);
    }

  });

  return (
    <React.Fragment>
      <Stack.Screen
        options={{
          title: t('editProfile'),
          headerShadowVisible: false,
          headerLeft: (props) => (
            <MaterialCommunityIcons name={'chevron-left'} size={32} onPress={() => router.back()} />
          ),
          headerBackVisible: false,
          contentStyle: { backgroundColor: 'white' },
        }}
      />

      <ScrollView className='flex-1'>
        <View className='p-6'>
          <Text className='font-bold text-lg mb-6'>{t('editYourProfile')}</Text>

          <FormInput
            name='displayName'
            control={control}
            placeholder={t('enterYourDisplayName')}
          />
          <FormInput
            name='email'
            control={control}
            placeholder={t('enterYourEmail')}
            textInputProps={{ editable: false }}
          />

          <Button
            title={t('updateProfile')}
            onPress={handleUpdateProfile}
            loading={isLoading}
            className='mt-6'
          />
        </View>
      </ScrollView>
    </React.Fragment>
  );
}

export default ProfileEdit;