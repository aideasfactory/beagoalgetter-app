import React from 'react';
import { useHasLaunched } from '../hooks/useHasLaunched';
import { useStorageState, setStorageItemAsync } from '../hooks/useStorageState';
import { supabase } from '@/supabase';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
// import * as Updates from 'expo-updates';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants';

let GoogleSignin: any;
if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@/utils').GoogleSignin;
  } catch (e) {
    console.log('GoogleSignin not available');
  }
}

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => void;
  signInWithSkip: () => void;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string) => void;
  resetPassword: (email: string) => void;
  updateProfile: (profileData: any) => Promise<void>;
  session: string | null;
  setSession: (session: [string | null, any | null]) => void;
  hasLaunched: boolean;
  setHasLaunched: (value: boolean) => void;
  user: any | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signInWithSkip: () => null,
  signInWithApple: async () => { },
  signInWithGoogle: async () => { },
  signInWithMagicLink: async () => { },
  signOut: () => null,
  signUp: () => null,
  resetPassword: () => null,
  updateProfile: async () => { },
  session: null,
  setSession: () => { },
  hasLaunched: false,
  setHasLaunched: () => {},
  user: null,
  isLoading: false,
});

export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session, user], setSession] = useStorageState<string, any>('session', [null, null]);
  const [hasLaunched, setHasLaunched] = useHasLaunched();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert(error.message);
      return;
    }
    setSession([!!data?.session?.access_token ? data?.session?.access_token : null, data?.user]);
    router.navigate('/(tabs)');
  };

  const signInWithSkip = async () => {
    setSession(['randomToken123', {
      id: '123',
      email: 'test@test.com',
      user_metadata: {
        name: 'Test User',
      },
    }]);
    router.navigate('/(tabs)');
  }

  const updateProfile = async (profileData: any) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: profileData.display_name,
      },
      email: profileData.email,
      phone: profileData.phone,
    });

    if (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      setSession([session, { ...user, ...data.user }]);
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

 
  const signInWithApple = async () => {
    try {
      if (Platform.OS === 'ios') {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });

          if (error) {
            console.error('Supabase sign in error:', error.message);
            Alert.alert('Error', error.message);
            return;
          }

          setSession([data.session?.access_token || null, data.user]);
          router.navigate('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Apple sign in error:', error);
      Alert.alert('Error', 'An error occurred during sign in. Please try again.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        console.warn('Google Sign-In not implemented for web');
        return;
      }

      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        Alert.alert('Not Supported', 'Google Sign-In is not supported in Expo Go. Please use a development build or a production build.');
        return;
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken;

      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (!error) {
          setSession([data?.session?.access_token || null, data?.user]);
          router.navigate('/(tabs)');
        } else {
          console.error('Google sign in error:', error.message);
        }
      } else {
        throw new Error('No ID token present!');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert(error.message);
      console.error('Sign up error:', error.message);
      return;
    }

    await supabase.from('profiles').insert({ id: data.user?.id });

    setSession([!!data?.session?.access_token ? data?.session?.access_token : null, data?.user]);
    router.navigate('/(tabs)');
  };

  const signOut = async () => {
    try {
      // 1. Sign out from Supabase
      await supabase.auth.signOut();

      // 2. Clear all stored data
      await AsyncStorage.clear();
      await setStorageItemAsync('session', null); // Clear session from SecureStore
      
      // 3. Reset state
      setSession([null, null]);
      setHasLaunched(false); // This will clear 'hasLaunched' in SecureStore via the hook

      // 4. Reload the app to ensure a completely fresh state
      // This is often more reliable than just clearing state for a "hard reset" experience
      if (Platform.OS !== 'web') {
        try {
          // await Updates.reloadAsync();
          router.replace('/');
        } catch (e) {
          // If reload fails (e.g. in development), we rely on the state changes above
          console.log('Failed to reload app:', e);
          router.replace('/');
        }
      } else {
        window.location.reload();
      }

    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: clear local state anyway
      setSession([null, null]);
      setHasLaunched(false);
      router.replace('/');
    }

  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert(error.message);
      console.error('Password reset error:', error.message);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'exp+launch-your-app://confirm',
      },
    });

    if (error) {
      console.error('Magic link sign in error:', error.message);
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for the magic link');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signInWithApple,
        signInWithGoogle,
        signOut,
        signUp,
        signInWithSkip,
        signInWithMagicLink,
        resetPassword,
        updateProfile,
        session,
        setSession,
        hasLaunched,
        setHasLaunched,
        user,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}