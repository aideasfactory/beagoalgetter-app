import { View, Image } from "react-native";

export const AppLogo = () => {
  return (
    <View className="h-24 items-center justify-center">
      <Image
        className="flex-1 object-cover items-center w-32 h-32"
        source={require('../assets/images/logo_black.png')}
      />
    </View>
  );
}