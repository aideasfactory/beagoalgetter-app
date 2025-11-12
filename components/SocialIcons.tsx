import { View, TouchableOpacity, Image, Text, Platform } from "react-native"
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSession } from "@/context"
import { Link } from "expo-router"
import { useTranslation } from 'react-i18next';

export const SocialIcons = () => {
  const { t } = useTranslation();
  const { signInWithApple, signInWithGoogle } = useSession()

  const isIos = Platform.OS === 'ios'

  return (
    <View className='flex flex-col gap-4 mt-2'>
      <View className="flex-row items-center">
        <View className="flex-1 bg-slate-400 h-0.5" />
        <Text className="pl-4 pr-4">{t('or')}</Text>
        <View className="flex-1 bg-slate-400 h-0.5" />
      </View>
      {isIos ? <TouchableOpacity className="mt-4 border-solid border-gray-300 border h-12 items-center justify-center rounded-xl flex-row" onPress={signInWithApple}>
        <MaterialCommunityIcons name={'apple'} size={25} />
        <Text className="pl-2">{t('continueWithApple')}</Text>
      </TouchableOpacity> : null}
      <TouchableOpacity className="mt-4 border-solid border-gray-300 border h-12 items-center justify-center rounded-xl flex-row" onPress={signInWithGoogle}>
        <Image source={require('@/assets/images/google_icon.png')} style={{ width: 35, height: 35 }} />
        <Text className="pl-2">{t('continueWithGoogle')}</Text>
      </TouchableOpacity>
      <Link href={'/magic-link'} asChild>
        <TouchableOpacity className="mt-4 border-solid border-gray-300 border h-12 items-center justify-center rounded-xl flex-row">
          <MaterialCommunityIcons name={'magic-staff'} size={25} />
          <Text className="pl-2">{t('continueWithMagicLink')}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}