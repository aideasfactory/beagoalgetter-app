import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  textInputProps,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-2 py-1">
      <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        className="flex-1 text-white ml-3"
        {...textInputProps}
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color="rgba(255,255,255,0.4)"
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}
