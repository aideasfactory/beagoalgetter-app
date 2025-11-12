import React from "react";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

export function useHasLaunched(): [boolean, (value: boolean) => void] {
  const [hasLaunched, setHasLaunchedState] = React.useState<boolean>(false);

  React.useEffect(() => {
    const getStoredValue = async () => {
      try {
        let value;
        if (Platform.OS === 'web') {
          value = localStorage.getItem('hasLaunched');
        } else {
          value = await SecureStore.getItemAsync('hasLaunched');
        }
        setHasLaunchedState(value === 'true');
      } catch (e) {
        console.error('Error getting hasLaunched:', e);
      }
    };
    getStoredValue();
  }, []);

  const setHasLaunched = (value: boolean) => {
    setHasLaunchedState(value);
    if (Platform.OS === 'web') {
      localStorage.setItem('hasLaunched', value ? 'true' : 'false');
    } else {
      SecureStore.setItemAsync('hasLaunched', value ? 'true' : 'false');
    }
  };

  return [hasLaunched, setHasLaunched];
}
