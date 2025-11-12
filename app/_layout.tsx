import { SessionProvider, useSession } from '@/context';
import Settings from '@/Settings';
import { GoogleSignin } from '@/utils';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Superwall from "expo-superwall/compat";
import { useEffect, useState } from 'react';
import { LogBox, Platform } from 'react-native';
import Constants from 'expo-constants';
import "../global.css";
import { LoadingScreen } from '@/components';
import i18n from '../i18n';
import { I18nextProvider } from 'react-i18next';

export {
  ErrorBoundary
} from 'expo-router';

export default function Root() {

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const isExpoGo = Constants.appOwnership === 'expo';

        if (!isExpoGo && Platform.OS !== 'web') {
          Superwall.configure({
            apiKey:
              Platform.select({
                ios: Settings.Superwall.iOSApiKey,
                android: Settings.Superwall.AndroidApiKey,
              }) || '',
          });
        }

        if (fontsLoaded) {
          if (!isExpoGo && Platform.OS !== 'web') {
            GoogleSignin.configure({
              scopes: ['https://www.googleapis.com/auth/drive.readonly'],
              webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
              iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
            });
          }

          Sentry.init({
            dsn: process.env.SENTRY_DSN,
            debug: true,
          });
        }

      
      } catch {
        console.log('error')
      }
    };

    init();
    LogBox.ignoreAllLogs();
  }, [fontsLoaded]);


  return (
    <I18nextProvider i18n={i18n}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </I18nextProvider>
  );
}


function RootNavigator() {
  const { session, hasLaunched, isLoading } = useSession();
  const [initialLoaded, setInitialLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const shouldShowOnboarding = (!hasLaunched && !session) || Settings.ALWAYS_SHOW_ONBOARDING;
  const shouldShowAuth = !session && hasLaunched
  const shouldShowApp = !!session && hasLaunched

  const shouldShowLoading = isLoading || !initialLoaded

  if (shouldShowLoading) return <LoadingScreen />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={shouldShowOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={shouldShowApp}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={shouldShowAuth}>
        <Stack.Screen name="initial" />
        <Stack.Screen name="login"  />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>
    </Stack>
  );
}

