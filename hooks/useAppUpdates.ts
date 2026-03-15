import { useEffect, useCallback, useState, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';

// Lazy-load expo-updates to prevent crash when native module isn't available (dev builds, Expo Go)
let Updates: typeof import('expo-updates') | null = null;
try {
  Updates = require('expo-updates');
} catch {
  // Native module not available — expected in dev/Expo Go
}

// ── DEV SIMULATION ──────────────────────────────────────────────
// Set to true to simulate the update toast in development mode.
// Set back to false before committing / building.
const SIMULATE_UPDATE = __DEV__ && false;
const SIMULATE_DELAY_MS = 4000; // how long the "downloading" toast stays visible
// ────────────────────────────────────────────────────────────────

// Minimum interval between update checks (5 minutes)
const CHECK_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Hook that manages OTA updates via expo-updates.
 *
 * On mount, checks for available updates in the background.
 * When the app returns from background, checks again (with cooldown).
 * If an update is found, it downloads and applies it automatically.
 *
 * Also exposes `checkForUpdate` for manual triggering.
 *
 * Safe to call in any environment — no-ops when expo-updates isn't available.
 */
export function useAppUpdates() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  const updatesEnabled = !isExpoGo && !isWeb && !__DEV__ && Updates !== null;

  const lastCheckRef = useRef<number>(0);

  // ── Simulated state (dev only) ──
  const [simChecking, setSimChecking] = useState(false);
  const [simDownloading, setSimDownloading] = useState(false);

  useEffect(() => {
    if (!SIMULATE_UPDATE) return;

    // Simulate: checking → downloading → done
    setSimChecking(true);
    const t1 = setTimeout(() => {
      setSimChecking(false);
      setSimDownloading(true);
    }, 1500);

    const t2 = setTimeout(() => {
      setSimDownloading(false);
    }, 1500 + SIMULATE_DELAY_MS);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Real state ──
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
    isChecking: realIsChecking,
    isDownloading: realIsDownloading,
    currentlyRunning,
  } = updatesState;

  // Merge real + simulated states
  const isChecking = realIsChecking || simChecking;
  const isDownloading = realIsDownloading || simDownloading;

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
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_COOLDOWN_MS) return;
    lastCheckRef.current = now;
    try {
      await Updates.checkForUpdateAsync();
    } catch {
      // Silently fail — update check is non-critical
    }
  }, [updatesEnabled]);

  // Check for updates on mount (cold launch)
  useEffect(() => {
    if (!updatesEnabled) return;
    checkForUpdate();
  }, [updatesEnabled, checkForUpdate]);

  // Check for updates when app returns from background
  useEffect(() => {
    if (!updatesEnabled) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, [updatesEnabled, checkForUpdate]);

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
