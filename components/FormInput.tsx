import { Controller, Control, FieldError } from 'react-hook-form';
import { Text, TextInput, TextInputProps, View } from 'react-native';

export type FormInputProps = {
  name: string;
  control: Control<any>;
  placeholder?: string;
  textInputProps?: TextInputProps;
}

export const FormInput = ({ name, control, placeholder, textInputProps }: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className='w-full'>
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={placeholder}
            className="h-12 w-full px-4 border border-gray-300 rounded-2xl mb-2 focus:border-sky-500"
            {...textInputProps}
          />
          {error && <Text className="mb-4" style={{ color: 'red' }}>{error.message}</Text>}
        </View>
      )}
    />
  );
}
