import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface IconCircleProps {
  icon: IoniconsName;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'tint';
  color?: string;
}

const SIZE_CONFIG = {
  sm: { container: 'w-8 h-8', iconSize: 18 },
  md: { container: 'w-10 h-10', iconSize: 20 },
  lg: { container: 'w-12 h-12', iconSize: 24 },
} as const;

const BRAND_CYAN = '#00c2ff';

export function IconCircle({
  icon,
  size = 'md',
  variant = 'solid',
  color = BRAND_CYAN,
}: IconCircleProps) {
  const { container, iconSize } = SIZE_CONFIG[size];
  const backgroundColor = variant === 'solid' ? color : `${color}20`;
  const iconColor = variant === 'solid' ? 'black' : color;

  return (
    <View
      className={`${container} rounded-full items-center justify-center`}
      style={{ backgroundColor }}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </View>
  );
}
