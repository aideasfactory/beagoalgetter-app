import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  description?: string;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  onPress,
  icon = 'info',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
    >
      <View className="bg-blue-100 rounded-lg p-2 mr-4">
        <MaterialIcons name={icon} size={24} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{title}</Text>
        {description && (
          <Text className="text-sm text-gray-600 mt-1">{description}</Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );
};