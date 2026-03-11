import { useCallback } from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerOptions {
  aspect?: [number, number];
  quality?: number;
}

interface UseImagePickerReturn {
  pickImage: () => Promise<string | null>;
}

/**
 * Hook that presents an action sheet to take a photo or choose from library.
 * Returns the selected image URI or null if cancelled.
 */
export function useImagePicker(options: ImagePickerOptions = {}): UseImagePickerReturn {
  const { aspect = [4, 3], quality = 0.8 } = options;

  const launchCamera = useCallback(async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access in your device settings to take photos.',
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect,
      quality,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  }, [aspect, quality]);

  const launchLibrary = useCallback(async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please allow photo library access in your device settings to upload images.',
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect,
      quality,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  }, [aspect, quality]);

  const pickImage = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Take Photo', 'Choose from Library', 'Cancel'],
            cancelButtonIndex: 2,
          },
          async (buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(await launchCamera());
            } else if (buttonIndex === 1) {
              resolve(await launchLibrary());
            } else {
              resolve(null);
            }
          },
        );
      } else {
        Alert.alert('Add Photo', 'Choose an option', [
          {
            text: 'Take Photo',
            onPress: async () => resolve(await launchCamera()),
          },
          {
            text: 'Choose from Library',
            onPress: async () => resolve(await launchLibrary()),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]);
      }
    });
  }, [launchCamera, launchLibrary]);

  return { pickImage };
}
