import { useEffect, useRef } from "react"
import { View, Animated, Image, Easing } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export const LoadingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(0.85)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [pulseAnim, fadeAnim])

  return (
    <LinearGradient
      colors={["#0f2341", "#0a1628", "#060e1a"]}
      locations={[0, 0.5, 1]}
      style={{ flex: 1 }}
    >
      <Animated.View
        className="flex-1 items-center justify-center"
        style={{ opacity: fadeAnim }}
      >
        {/* Target icon with pulse */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Image
            source={require("../assets/images/splash-icon.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App name */}
        <View className="mt-6">
          <Animated.Text
            className="text-white text-xl font-bold tracking-widest"
            style={{ opacity: fadeAnim, letterSpacing: 4 }}
          >
            GOAL GETTER
          </Animated.Text>
        </View>

        {/* Subtle loading bar */}
        <View className="mt-8 w-12 h-0.5 rounded-full overflow-hidden bg-white/10">
          <LoadingBar />
        </View>
      </Animated.View>
    </LinearGradient>
  )
}

function LoadingBar() {
  const translateX = useRef(new Animated.Value(-48)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 48,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start()
  }, [translateX])

  return (
    <Animated.View
      className="h-full w-6 rounded-full"
      style={{
        backgroundColor: "#00c2ff",
        transform: [{ translateX }],
      }}
    />
  )
}
