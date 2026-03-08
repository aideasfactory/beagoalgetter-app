import { useEffect, useCallback } from 'react';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Hook that manages OTA updates via expo-updates.
 *
 * On mount, checks for available updates in the background.
 * If an update is found, it downloads and applies it on next app restart.
 *
 * Also exposes `checkForUpdate` for manual triggering.
 */
export function useAppUpdates() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  const updatesEnabled = !isExpoGo && !isWeb && !__DEV__;

  const {
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    currentlyRunning,
  } = updatesEnabled
    ? Updates.useUpdates()
    : {
        isUpdateAvailable: false,
        isUpdatePending: false,
        isChecking: false,
        isDownloading: false,
        currentlyRunning: null,
      };

  // When an update has been downloaded, reload the app to apply it
  useEffect(() => {
    if (isUpdatePending) {
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  // When an update is available, download it automatically
  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync();
    }
  }, [isUpdateAvailable]);

  const checkForUpdate = useCallback(async () => {
    if (!updatesEnabled) return;
    try {
      await Updates.checkForUpdateAsync();
    } catch {
      // Silently fail — update check is non-critical
    }
  }, [updatesEnabled]);

  return {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdatePending,
    currentlyRunning,
    checkForUpdate,
    updatesEnabled,
  };
}
