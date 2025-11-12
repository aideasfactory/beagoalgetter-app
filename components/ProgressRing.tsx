import React from 'react';
import { View, ViewProps, Text } from 'react-native';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  color?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  showPercentage?: boolean;
  style?: ViewProps['style'];
}

export function ProgressRing({
  progress,
  size = 80,
  color = '#00c2ff',
  strokeWidth = 8,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showPercentage = false,
  style,
}: ProgressRingProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Calculate rotation for the progress indicator
  const rotation = (clampedProgress / 100) * 360;

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {/* Background Ring */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Progress Ring Overlay */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: color,
            borderRightColor: clampedProgress > 25 ? color : 'transparent',
            borderBottomColor: clampedProgress > 50 ? color : 'transparent',
            borderLeftColor: clampedProgress > 75 ? color : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
        
        {/* Percentage Text (Optional) */}
        {showPercentage && (
          <Text
            style={{
              color: color,
              fontSize: size / 4,
              fontWeight: 'bold',
            }}
          >
            {Math.round(clampedProgress)}%
          </Text>
        )}
      </View>
    </View>
  );
}
