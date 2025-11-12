import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps {
  text: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewProps['style'];
}

export function Badge({ text, color = '#00c2ff', size = 'md', style }: BadgeProps) {
  // Extract RGB from hex color for opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 194, b: 255 }; // Default to cyan
  };

  const rgb = hexToRgb(color);
  const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={`rounded-full ${sizeStyles[size]} items-center justify-center`}
      style={[{ backgroundColor }, style]}
    >
      <Text
        className={`${textSizeStyles[size]} font-bold uppercase`}
        style={{ color }}
      >
        {text}
      </Text>
    </View>
  );
}
