import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AvatarProps {
  avatarUrl?: string;
  fullName?: string;
  displayName?: string;
  email?: string;
  size?: number;
}

const getInitials = (name?: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  fullName,
  displayName,
  email,
  size = 96,
}) => {
  const { t } = useTranslation();
  
  return (
    <View className="items-center mb-8">
      <View
        style={{ width: size, height: size }}
        className="rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: '#00c2ff' }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl } as ImageSourcePropType}
            style={{ width: size, height: size }}
            className="rounded-full"
          />
        ) : (
          <Text className="text-white text-3xl font-bold">
            {getInitials(fullName)}
          </Text>
        )}
      </View>
      <Text className="text-xl font-bold">{displayName || t('userName')}</Text>
      <Text className="text-gray-500">{email || t('userEmail')}</Text>
    </View>
  );
};