import { View, ActivityIndicator } from "react-native"

export const LoadingScreen = () => {
  return (
    <View className="flex items-center justify-center w-full h-full bg-black">
      <ActivityIndicator color="#00c2ff" />
    </View>
  )
}