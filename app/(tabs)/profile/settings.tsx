import { SettingsRow } from '@/components';
import { useSession } from '@/context';
import { sendPushNotification } from '@/Notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import Superwall from "expo-superwall/compat";
import React from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ProfileSettings() {
  const { t } = useTranslation();
  const { user } = useSession()

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

  const handlePresentPaywall = async  () => {
    Superwall.shared.register({ 
      placement: 'test_event',
      feature: () => {
        console.log('hello world')
      },
    });
  }


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