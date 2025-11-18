import { SettingsRow } from '@/components';
import { useSession, useSubscription } from '@/context';
import { sendPushNotification } from '@/Notifications';
import { useProfile } from '@/hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ProfileSettings() {
  const { t } = useTranslation();
  const { user } = useSession()
  const { profile, loading: profileLoading } = useProfile();
  const { isPaid, showPaywall, isLoading: subscriptionLoading } = useSubscription();

  const handleTestError = async () => {
    try {
      Alert.alert('Test Error', 'This is a test error to test Sentry');

      throw new Error('Test Error');
      
    } catch (error) {
      console.error(error);
    }
  }


  const handleTestNotifications = async () => {

    if (!user?.notificationToken) {
      Alert.alert('No Notification Token', 'Please authenticate to test notifications');
      return;
    }

    try {
      await sendPushNotification(user?.notificationToken)
    } catch (error) {
      console.error(error);
    }
  }

  const handlePresentPaywall = async () => {
    if (profileLoading || subscriptionLoading) {
      Alert.alert('Please wait', 'Loading your profile...');
      return;
    }

    if (!profile) {
      Alert.alert('No profile', 'You need to be signed in to view the paywall.');
      return;
    }

    if (isPaid) {
      Alert.alert('Premium active', 'You already have premium access.');
      return;
    }

    await showPaywall('goalgetter');
  };


  return (
    <React.Fragment>
      <Stack.Screen 
        options={{ 
          title: t('appSettings'),
          headerShadowVisible: false,
          headerLeft: (props) => (
            <MaterialCommunityIcons name={'chevron-left'} size={32} onPress={() => router.back()} />
          ),
          headerBackVisible: false,
          contentStyle: { backgroundColor: 'white' },
        }}
      />

        <View className='p-6'>
          <SettingsRow
            label={'Test Sentry'}
            icon={'account'}
            onPress={() => handleTestError()}
          />
          <SettingsRow 
            icon={'account-cog'}
            label={'Test Paywall'}
            onPress={() => handlePresentPaywall()}
          />
          <SettingsRow 
            label={'Test Notifications'}
            onPress={() => handleTestNotifications()}
            icon={'account-heart'}
          />
        </View>
    </React.Fragment>
    
    
  );
}