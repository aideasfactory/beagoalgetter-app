import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';


type SettingsRowProps = {
  label?: string
  href?: Href
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  onPress?: () => void
};

export const SettingsRow = ({ label, href, icon = 'archive', onPress }: SettingsRowProps) => {
  return (
    href ? (
      <Link asChild href={href}>
        <TouchableOpacity className='flex flex-row items-center w-full pt-4 pb-4'>
          <MaterialCommunityIcons name={icon} size={20} />
          <Text className='ml-2'>{label}</Text>
          <View className='items-center ml-auto'>
            <MaterialCommunityIcons
              name={'chevron-right'}
              size={20}
            />
          </View>
        </TouchableOpacity>
      </Link>
    ) : (
      <TouchableOpacity className='flex flex-row items-center w-full pt-4 pb-4' onPress={onPress}>
          <MaterialCommunityIcons name={icon} size={20} />
        <Text className='ml-2'>{label}</Text>
        <View className='items-center ml-auto'>
          <MaterialCommunityIcons
            name={'chevron-right'}
            size={20}
          />
        </View>
      </TouchableOpacity>
    )
  );
};