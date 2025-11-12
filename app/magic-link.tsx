import { Button, FormInput } from "@/components"
import { useSession } from "@/context"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"
import { View, Text } from "react-native"
import { useTranslation } from 'react-i18next';
import { z } from "zod"

const MagicLink = () => {
  const { t } = useTranslation();
  const { signInWithMagicLink } = useSession()

  const [isLoading, setIsLoading] = React.useState(false);

  const magicLinkShema = z.object({
    email: z.string().email().min(3, 'Email require at least 3 characters'),
  })

  type magicLinkFormData = z.infer<typeof magicLinkShema>

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors }
  } = useForm<magicLinkFormData>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(magicLinkShema),
    mode: 'onChange'
  })

  const handleMagicLink = handleSubmit(async (data: magicLinkFormData) => {
    setIsLoading(true);

    try {
      await signInWithMagicLink(data.email)
    } catch (error) {
      console.error('Send magic link failed:', error);
    } finally {
      setIsLoading(false);
    }
  })

  return (
    <View className="flex-1 pr-6 pl-6">
      <View className='flex-1 justify-center items-center'>
        <View className='items-center mb-10 gap-2 w-full'>
          <Text className="text-black mb-8 font-bold text-xl">{t('sendMagicLinkScreen')}</Text>
          <FormInput 
            name='email'
            control={control}
            placeholder={t('enterYourEmail')}
          />
          <Button 
            title={t('sendMagicLink')}
            loading={isLoading}
            onPress={handleMagicLink}
          />
        </View>
      </View>
    </View>
  )
}

export default MagicLink 