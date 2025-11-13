import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type OnboardingProps = {
  onGetStarted: () => void;
  onLogin: () => void;
}

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  image: string;
}

export const Onboarding = ({ onGetStarted, onLogin }: OnboardingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      icon: 'disc-outline',
      title: 'Be a Goal Getter',
      description: 'Set goals. Stay accountable.',
      color: '#00c2ff',
      image: 'https://images.unsplash.com/photo-1596913152332-e56f2cc8165c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwcnVubmluZyUyMHRyYWNrfGVufDF8fHx8MTc2MjQyMTU4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '2',
      icon: 'trending-up',
      title: 'Track Progress',
      description: 'Set personal or group goals and track your progress every single day\n\nBuild streaks, earn ability points, and visualize your journey to success.\n\nJoin friends, compete on leaderboards, and celebrate wins together.',
      color: '#00c2ff',
      image: 'https://images.unsplash.com/photo-1620188500179-32ac33c60848?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB3b3Jrb3V0JTIwdHJhaW5pbmd8ZW58MXx8fHwxNzYyMzE4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '3',
      icon: 'people',
      title: 'Challenge Yourself',
      description: 'Join in a 5k a day challenge or a 100 push-ups a day challenge.\n\nChallenge yourself to read 10 pages a day or to meditate for 10 minutes a day.\n\nDrink 8 glasses of water a day, challenge yourself to be more active every day.',
      color: '#00c2ff',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1080',
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      onGetStarted();
    }
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const slideSize = screenWidth;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentIndex(index);
      },
    }
  );

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width: screenWidth, height: screenHeight }}>
      {/* Background Image with Overlay */}
      <Image
        source={{ uri: item.image }}
        style={{
          width: screenWidth,
          height: screenHeight,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.6)', '#000000']}
        locations={[0, 0.6, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Content */}
      <View style={{ flex: 1, padding: 24 }}>
        {/* Logo at top */}
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 160, height: 40, marginTop: 40 }}
          resizeMode="contain"
        />

        {/* Main Content - Pushed to bottom */}
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 200, maxWidth: 480, alignSelf: 'center', width: '100%' }}>
          {/* Icon Box */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: `${item.color}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Ionicons name={item.icon} size={40} color={item.color} />
          </View>

          {/* Text Content Card with Glassmorphism */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 24,
              padding: 24,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>
              {item.title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 24 }}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDots = () => {
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const width = scrollX.interpolate({
            inputRange,
            outputRange: [8, 32, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? '#00c2ff' : 'rgba(255,255,255,0.3)',
                marginHorizontal: 4,
                width,
                opacity,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />
      
      {/* Navigation - Fixed at bottom */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
      }}>
        {/* Dots */}
        {renderDots()}

        {/* Get Started / Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: '#00c2ff',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#000000', fontSize: 17, fontWeight: 'bold', marginRight: 8 }}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          onPress={onLogin}
          style={{
            alignItems: 'center',
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Already have an account?{' '}
            <Text style={{ color: '#00c2ff' }}>
              Log in
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}