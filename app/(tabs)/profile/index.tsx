import { Avatar, SettingsRow } from '@/components';
import { useSession } from '@/context';
import { Stack } from 'expo-router';
import React from 'react';
import { View, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import Settings from '@/Settings';

export default function ProfileMain() {
  const { t } = useTranslation();
  const { signOut, user } = useSession()

  const handleLogout = () => {
    signOut()
  }

  return (
    <React.Fragment>
      <Stack.Screen
        options={{
              headerShown: true,
              headerShadowVisible: false,
              title: t('profile'),
              contentStyle: { backgroundColor: 'white' },
        }}
      />

      <View className='pl-6 pr-6 flex-1 mt-8'>

        <Avatar 
          avatarUrl={user?.avatar_url}
          fullName={user?.full_name}
          displayName={user?.user_metadata?.display_name}
          email={user?.email}
        />

        <SettingsRow
          label={t('appSettings')}
          icon={'account'}
          href={'/profile/settings'}
        />
        <SettingsRow
          icon={'account-cog'}
          label={'My Account'}
          href={'/profile/edit'}
        />
        <SettingsRow
          label={'Privacy Policy'}
          onPress={() => Linking.openURL(Settings.PrivacyPolicy)}
          icon={'account-heart'}
        />
        <SettingsRow
          label={'Terms & Conditions'}
          onPress={() => Linking.openURL(Settings.TermsAndConditions)}
          icon={'account-box'}
        />
        <SettingsRow
          label={'Logout'}
          onPress={() => handleLogout()}
          icon={'logout'}
        />
      </View>
    </React.Fragment>
  );
}