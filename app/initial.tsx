import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppLogo, Button } from '@/components';
import { useSession } from '@/context';

const InitialScreen = () => {
  const { signInWithSkip } = useSession()

  const { t } = useTranslation();

  return (
    <View className='flex-1 w-full h-full justify-center items-center pr-6 pl-6'>
      <View className='mb-8'>
        <AppLogo />
      </View>
      <Text className='mb-2 text-2xl font-bold'>{t('welcome')}</Text>
      <Text className='mb-16'>{t('startBuildingYourApp')}</Text>
      <View className='w-full'> 
        <Link href={'/signup'} asChild>
          <Button title={t('createAnAccount')} className='mb-0 mt-0' />
        </Link>
        <Link href={'/login'} asChild>
          <Button title={t('alreadyHaveAccount')} className='mt-0 mb-0' />
        </Link>
      </View>
    </View>
  );
}

export default InitialScreen
