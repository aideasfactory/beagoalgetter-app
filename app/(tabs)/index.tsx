import { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-3xl font-bold mb-4">Home Feed</Text>
        <Text className="text-white/60 text-center">
          Home feed with posts will be implemented here
        </Text>
      </View>
    </SafeAreaView>
  );
}