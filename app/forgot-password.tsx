import { Button, FormInput } from "@/components"
import { useSession } from "@/context"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "expo-router"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Text, View } from "react-native"
import { useTranslation } from 'react-i18next';
import { z } from "zod"


const ForgotPassword = () => {
  const { t } = useTranslation();
  const { resetPassword } = useSession()
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)
  const [isLoading, setIsLoading] = React.useState(false);
  
  const resetPasswordSchema = z.object({
    email: z.string().email().min(3, 'Email require at least 3 characters'),
  })

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  })

  const handleResetPassword = handleSubmit(async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      await resetPassword(data.email)
      setIsConfirmationVisible(true)
    } catch (error) {
      console.error('Reset password failed:', error)
    } finally { 
      setIsLoading(false)
    }
  })

  return (
    <View className="flex-1 pr-6 pl-6">
      <View className='flex-1 w-full justify-center items-center'>
        {isConfirmationVisible ? (
          <View className='items-center mb-10 gap-2 w-full'>
            <Text className="text-black mb-4">{t('checkEmailForReset')}</Text>

            <Link href={'/'} asChild>
              <Button 
                title={t('backToLogin')}
              />
            </Link>
          </View>
        ) : (
          <View className='items-center mb-10 gap-2 w-full'>
            <Text className="text-black mb-8 font-bold text-xl">{t('passwordReset')}</Text>
            <FormInput 
              placeholder={t('enterYourEmail')}
              control={control}
              name="email"
            />
            <Button 
              title={t('sendResetEmail')}
              loading={isLoading}
              onPress={handleResetPassword}
            />
          </View>
        )}
      </View>
    </View>
  )
}

export default ForgotPassword