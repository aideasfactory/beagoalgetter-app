import { useSession } from '@/context';
import { supabase } from '@/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text } from 'react-native';
import { useTranslation } from 'react-i18next';


export default function Confirm() {
  const { t } = useTranslation();
  const { setSession } = useSession();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    async function handleAuthentication() {
      const { accessToken, refreshToken, type } = params;

      if (typeof accessToken === 'string' && type === 'magiclink') {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken as string,
          });

          if (error) throw error;

          if (data?.session) {
            setSession([data.session.access_token, data.user]);
            router.replace('/(tabs)');
          } else {
            throw new Error('No session data returned');
          }
        } catch (error: any) {
          console.error('Error setting session:', error?.message);
          Alert.alert(t('error'), t('failedToAuthenticate'));
          router.replace('/login');
        }
      } else {
        console.error('Invalid or missing authentication data');
        Alert.alert(t('error'), t('invalidAuthenticationLink'));
        router.replace('/login');
      }
    }

    handleAuthentication();
  }, [params]);

  return <Text>{t('confirmingMagicLink')}</Text>;
}