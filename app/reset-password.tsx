import { useSession } from '@/context';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const ResetPassword = () => {
  const { t } = useTranslation();
  const { updatePassword } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordSchema = z
    .object({
      password: z.string().min(6, t('passwordMinLength')),
      confirmPassword: z.string().min(6, t('passwordMinLength')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const success = await updatePassword(data.password);
      if (success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Reset password failed:', error);
    } finally {
      setIsLoading(false);
    }
  });

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-black">
      <View className="absolute inset-0">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1080',
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.92)', '#000000']}
          locations={[0, 0.4, 0.85]}
          className="absolute inset-0"
        />
      </View>

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 pt-6">
              <Image
                source={require('@/assets/images/logo.png')}
                style={{ width: 160, height: 40 }}
                resizeMode="contain"
              />
            </View>

            <View className="flex-1 justify-center px-6 py-12">
              {isSuccess ? (
                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-6"
                    style={{ backgroundColor: 'rgba(0,194,255,0.15)' }}
                  >
                    <Ionicons name="checkmark-circle" size={40} color="#00c2ff" />
                  </View>
                  <Text className="text-white text-2xl font-bold mb-3">
                    {t('passwordUpdated')}
                  </Text>
                  <Text className="text-white/60 text-base text-center mb-8">
                    {t('passwordUpdatedMessage')}
                  </Text>
                  <TouchableOpacity
                    onPress={handleGoToLogin}
                    style={{ backgroundColor: '#00c2ff' }}
                    className="rounded-xl py-4 items-center w-full"
                    activeOpacity={0.8}
                  >
                    <Text className="text-black font-bold text-lg">
                      {t('backToLogin')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View className="mb-8">
                    <Text className="text-white text-3xl font-bold mb-2">
                      {t('resetYourPassword')}
                    </Text>
                    <Text className="text-white/60 text-base">
                      {t('enterNewPassword')}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-white/60 text-sm mb-2">
                      {t('newPassword')}
                    </Text>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-4 py-4">
                          <Ionicons
                            name="lock-closed"
                            size={20}
                            color="rgba(255,255,255,0.4)"
                          />
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="••••••••"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="password-new"
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
                      )}
                    />
                    {errors.password && (
                      <Text className="text-red-400 text-sm mt-1">
                        {errors.password.message}
                      </Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="text-white/60 text-sm mb-2">
                      {t('confirmNewPassword')}
                    </Text>
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-4 py-4">
                          <Ionicons
                            name="lock-closed"
                            size={20}
                            color="rgba(255,255,255,0.4)"
                          />
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="••••••••"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoComplete="password-new"
                            className="flex-1 text-white ml-3"
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="ml-2"
                          >
                            <Ionicons
                              name={showConfirmPassword ? 'eye-off' : 'eye'}
                              size={20}
                              color="rgba(255,255,255,0.4)"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                    {errors.confirmPassword && (
                      <Text className="text-red-400 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={onSubmit}
                    style={{ backgroundColor: '#00c2ff' }}
                    className="rounded-xl py-4 items-center mt-6"
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-black font-bold text-lg">
                        {t('updatePassword')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default ResetPassword;
