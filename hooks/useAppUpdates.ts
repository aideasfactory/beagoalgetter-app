import { useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Lazy-load expo-updates to prevent crash when native module isn't available (dev builds, Expo Go)
let Updates: typeof import('expo-updates') | null = null;
try {
  Updates = require('expo-updates');
} catch {
  // Native module not available — expected in dev/Expo Go
}

/**
 * Hook that manages OTA updates via expo-updates.
 *
 * On mount, checks for available updates in the background.
 * If an update is found, it downloads and applies it on next app restart.
 *
 * Also exposes `checkForUpdate` for manual triggering.
 *
 * Safe to call in any environment — no-ops when expo-updates isn't available.
 */
export function useAppUpdates() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  const updatesEnabled = !isExpoGo && !isWeb && !__DEV__ && Updates !== null;

  // useUpdates() must be called unconditionally (Rules of Hooks),
  // but we only use its values when updates are enabled.
  const updatesState = Updates?.useUpdates?.() ?? {
    isUpdateAvailable: false,
    isUpdatePending: false,
    isChecking: false,
    isDownloading: false,
    currentlyRunning: null,
  };

  const {
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    currentlyRunning,
  } = updatesState;

  // When an update has been downloaded, reload the app to apply it
  useEffect(() => {
    if (updatesEnabled && isUpdatePending) {
      Updates!.reloadAsync();
    }
  }, [updatesEnabled, isUpdatePending]);

  // When an update is available, download it automatically
  useEffect(() => {
    if (updatesEnabled && isUpdateAvailable) {
      Updates!.fetchUpdateAsync();
    }
  }, [updatesEnabled, isUpdateAvailable]);

  const checkForUpdate = useCallback(async () => {
    if (!updatesEnabled || !Updates) return;
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
