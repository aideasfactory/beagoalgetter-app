import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from '@/context';
import { router } from 'expo-router';

interface AuthScreenProps {
  mode: 'login' | 'signup';
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signInWithMagicLink,
    resetPassword,
  } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple sign in error:', error);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }
    try {
      await signInWithMagicLink(email);
    } catch (error) {
      console.error('Magic link error:', error);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }
    resetPassword(email);
    Alert.alert('Success', 'Check your email for password reset instructions');
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Background Image with Gradient Overlay */}
        <View className="absolute inset-0">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1667791275929-5701d83734c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', '#000000']}
            locations={[0, 0.5, 1]}
            className="absolute inset-0"
          />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo - Optional, can be replaced with actual logo */}
          <View className="px-6 pt-6">
            <Text
              className="text-3xl font-bold"
              style={{ color: '#00c2ff' }}
            >
              Goal Getter
            </Text>
          </View>

          {/* Content Container */}
          <View className="flex-1 justify-center px-6 py-12">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-white text-3xl font-bold mb-2">
                {mode === 'signup' ? '' : 'Welcome Back'}
              </Text>
              <Text className="text-white/60 text-base">
                {mode === 'signup'
                  ? 'Start your journey to consistency'
                  : 'Continue your streak'}
              </Text>
            </View>

            {/* Social Auth Buttons */}
            <View className="flex-row gap-3 mb-6">
              {/* Google */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center backdrop-blur-xl"
                activeOpacity={0.7}
              >
                <Image
                  source={require('@/assets/images/google_icon.png')}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>

              {/* Email / Magic Link */}
              <TouchableOpacity
                onPress={handleMagicLink}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center backdrop-blur-xl"
                activeOpacity={0.7}
              >
                <Ionicons name="mail" size={24} color="white" />
              </TouchableOpacity>

              {/* Apple */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center backdrop-blur-xl"
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-apple" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-white/10" />
              <Text className="text-white/40 px-4 text-sm">
                Or continue with email
              </Text>
              <View className="flex-1 h-[1px] bg-white/10" />
            </View>

            {/* Form */}
            <View className="space-y-4">
              {/* Name Field (Signup Only) */}
              {mode === 'signup' && (
                <View className="mb-4">
                  <Text className="text-white/60 text-sm mb-2">Full Name</Text>
                  <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-4 py-4">
                    <Ionicons
                      name="person"
                      size={20}
                      color="rgba(255,255,255,0.4)"
                    />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="John Doe"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      className="flex-1 text-white ml-3"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-white/60 text-sm mb-2">Email</Text>
                <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-4 py-4">
                  <Ionicons
                    name="mail"
                    size={20}
                    color="rgba(255,255,255,0.4)"
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 text-white ml-3"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-white/60 text-sm mb-2">Password</Text>
                <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-4 py-4">
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color="rgba(255,255,255,0.4)"
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete={mode === 'signup' ? 'password-new' : 'password'}
                    className="flex-1 text-white ml-3"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="rgba(255,255,255,0.4)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link (Login Only) */}
              {mode === 'login' && (
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  className="items-end mb-4"
                >
                  <Text style={{ color: '#00c2ff' }} className="text-sm">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={{ backgroundColor: '#00c2ff' }}
                className="rounded-xl py-4 items-center mt-6"
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold text-lg">
                    {mode === 'signup' ? 'Create Account' : 'Log In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Mode */}
              <TouchableOpacity
                onPress={() =>
                  router.push(mode === 'login' ? '/signup' : '/login')
                }
                className="mt-6 items-center"
              >
                <Text className="text-white/60">
                  {mode === 'signup'
                    ? 'Already have an account? '
                    : "Don't have an account? "}
                  <Text style={{ color: '#00c2ff' }}>
                    {mode === 'signup' ? 'Log in' : 'Sign up'}
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Terms & Privacy (Signup Only) */}
              {mode === 'signup' && (
                <Text className="text-white/40 text-xs text-center mt-6 px-4">
                  By creating an account, you agree to our{' '}
                  <Text className="text-white/60 underline">
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text className="text-white/60 underline">Privacy Policy</Text>
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
