import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, TextProps, ActivityIndicator } from 'react-native';

export type ButtonProps = TouchableOpacityProps & {
  title: string;
  onPress?: () => void;
  color?: string;
  textProps?: TextProps;
  loading?: boolean;
  loadingColor?: string;
}

const mergeClasses = (defaultClasses: string, additionalClasses?: string): string =>
  additionalClasses ? `${defaultClasses} ${additionalClasses}` : defaultClasses;

export const Button = (props: ButtonProps) => {
  const {
    title,
    onPress,
    color = 'blue-500',
    textProps,
    loading = false,
    className,
    ...touchableOpacityProps
  } = props;

  const defaultTouchableClasses = "mt-2 bg-blue-600 w-full h-12 rounded-2xl flex-row mb-2 justify-center items-center";
  const mergedTouchableClasses = mergeClasses(defaultTouchableClasses, className);

  return (
    <TouchableOpacity
      className={mergedTouchableClasses}
      onPress={onPress}
      disabled={loading}
      {...touchableOpacityProps}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text {...textProps} className="text-white text-center font-bold">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}