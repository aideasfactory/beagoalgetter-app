import { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator } from 'react-native';

interface UpdateToastProps {
  visible: boolean;
  message?: string;
}

export function UpdateToast({ visible, message = 'Updating app...' }: UpdateToastProps) {
  const translateY = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : -200,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [visible, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute top-0 left-0 right-0 z-50"
      style={{ transform: [{ translateY }] }}
    >
      <View className="mx-4 mt-16 rounded-2xl bg-gray-900 border border-gray-700 px-5 py-4 flex-row items-center shadow-lg">
        <ActivityIndicator size="small" color="#00c2ff" />
        <Text className="text-white text-sm font-medium ml-3 flex-1">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
