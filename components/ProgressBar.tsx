import React from 'react';
import { View, ViewProps } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  backgroundColor?: string;
  style?: ViewProps['style'];
}

export function ProgressBar({
  progress,
  color = '#00c2ff',
  height = 8,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  style,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View
      className="w-full rounded-full overflow-hidden"
      style={[{ height, backgroundColor }, style]}
    >
      <View
        className="h-full rounded-full"
        style={{
          width: `${clampedProgress}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
