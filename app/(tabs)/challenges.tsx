import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChallengesScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-3xl font-bold mb-4">Challenges</Text>
        <Text className="text-white/60 text-center">
          Challenge list screen will be implemented here
        </Text>
      </View>
    </SafeAreaView>
  );
}
