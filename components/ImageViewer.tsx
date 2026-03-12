import React, { useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 150;

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

export function ImageViewer({ visible, imageUrl, onClose }: ImageViewerProps) {
  const scaleRef = useRef(1);
  const translateXRef = useRef(0);
  const translateYRef = useRef(0);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Track pinch
  const baseScale = useRef(1);
  const lastScale = useRef(1);

  const resetTransform = useCallback(() => {
    scaleRef.current = 1;
    translateXRef.current = 0;
    translateYRef.current = 0;
    baseScale.current = 1;
    lastScale.current = 1;
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [scale, translateX, translateY]);

  const handleClose = useCallback(() => {
    resetTransform();
    onClose();
  }, [onClose, resetTransform]);

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store current positions as offsets
        translateX.setOffset(translateXRef.current);
        translateY.setOffset(translateYRef.current);
        translateX.setValue(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.numberActiveTouches === 2) {
          // Pinch not supported via PanResponder — handled by double-tap instead
          return;
        }
        if (scaleRef.current > 1) {
          // Pan when zoomed
          translateX.setValue(gesture.dx);
          translateY.setValue(gesture.dy);
        } else {
          // Only allow vertical drag for dismiss
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        translateX.flattenOffset();
        translateY.flattenOffset();

        if (scaleRef.current > 1) {
          // Clamp translation to bounds
          const maxX = ((scaleRef.current - 1) * SCREEN_WIDTH) / 2;
          const maxY = ((scaleRef.current - 1) * SCREEN_HEIGHT) / 2;
          const clampedX = clamp(translateXRef.current + gesture.dx, -maxX, maxX);
          const clampedY = clamp(translateYRef.current + gesture.dy, -maxY, maxY);
          translateXRef.current = clampedX;
          translateYRef.current = clampedY;
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: clampedX,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: clampedY,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Dismiss or snap back
          if (Math.abs(gesture.dy) > DISMISS_THRESHOLD) {
            handleClose();
          } else {
            translateYRef.current = 0;
            Animated.timing(translateY, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  const lastTap = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap
      if (scaleRef.current > 1) {
        // Reset zoom
        resetTransform();
      } else {
        // Zoom in to 2.5x
        const targetScale = 2.5;
        scaleRef.current = targetScale;
        baseScale.current = targetScale;
        lastScale.current = targetScale;
        Animated.timing(scale, {
          toValue: targetScale,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      // Single tap — dismiss after delay if no second tap
      setTimeout(() => {
        if (lastTap.current === now && scaleRef.current <= 1) {
          handleClose();
        }
      }, 300);
    }
  }, [resetTransform, handleClose, scale]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black">
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          className="absolute top-14 right-4 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Image with Pan/Tap */}
        <Animated.View
          className="flex-1 items-center justify-center"
          style={{
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
          }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1} onPress={handleTap}>
            <Image
              source={{ uri: imageUrl }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
