import * as SecureStore from 'expo-secure-store';
import * as React from 'react';
import { Platform } from 'react-native';

type UseStateHook<T, U> = [[boolean, T | null, U | null], (value: [T | null, U | null]) => void];

function useAsyncState<T, U>(
  initialValue: [boolean, T | null, U | null] = [true, null, null],
): UseStateHook<T, U> {
  return React.useReducer(
    (state: [boolean, T | null, U | null], action: [T | null, U | null] = [null, null]): [boolean, T | null, U | null] => [
      false,
      action[0],
      action[1],
    ],
    initialValue
  ) as UseStateHook<T, U>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState<T, U>(key: string, initialValue: [T | null, U | null] = [null, null]): UseStateHook<T, U> {
  const [state, setState] = useAsyncState<T, U>([true, initialValue[0], initialValue[1]]);

  // Get
  React.useEffect(() => {
    const getStoredValue = async () => {
      try {
        let value;
        if (Platform.OS === 'web') {
          value = localStorage.getItem(key);
        } else {
          value = await SecureStore.getItemAsync(key);
        }
        if (value) {
          const parsedValue = JSON.parse(value);
          setState([parsedValue.session, parsedValue.user]);
        } else {
          setState([null, null]);
        }
      } catch (e) {
        console.error('Error retrieving stored value:', e);
        setState([null, null]);
      }
    };

    getStoredValue();
  }, [key, setState])

  // Set
  const setValue = React.useCallback(
    ([session, user]: [T | null, U | null]) => {
      setState([session, user]);
      const valueToStore = JSON.stringify({ session, user });
      if (Platform.OS === 'web') {
        localStorage.setItem(key, valueToStore);
      } else {
        SecureStore.setItemAsync(key, valueToStore);
      }
    },
    [key, setState]
  );

  return [state, setValue];
}