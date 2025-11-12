import { View, ActivityIndicator } from "react-native"

export const LoadingScreen = () => {
  return (
    <View className="flex items-center justify-center w-full h-full">
      <ActivityIndicator />
    </View>
  )
}