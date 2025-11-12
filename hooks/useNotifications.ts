import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSession } from '@/context/auth';
import { registerForPushNotificationsAsync } from '@/Notifications';

export function useNotifications() {
  const { session, user, setSession } = useSession();

  const updateSessionWithToken = useCallback(async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (session && user && !user.notificationToken) {
        setSession([session, { ...user, notificationToken: token }]);
      }
    } catch (error) {
      
    }
  }, [session, user, setSession]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    updateSessionWithToken();

    const notificationSubscription = Notifications.addNotificationReceivedListener(() => {
      
    });
    
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
      
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [updateSessionWithToken]);
}
