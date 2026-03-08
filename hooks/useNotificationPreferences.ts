import { useCallback, useEffect, useState } from 'react';
import type { NotificationPreferences } from '@/types/database.example';
import { notificationPreferencesService } from '@/services';

interface UseNotificationPreferencesResult {
  preferences: NotificationPreferences;
  loading: boolean;
  error: Error | null;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push_enabled: true,
  achievement_alerts: true,
  team_updates: true,
};

export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const prefs = await notificationPreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notification preferences'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      const previous = { ...preferences };
      setPreferences((current) => ({ ...current, [key]: value }));

      try {
        await notificationPreferencesService.updatePreferences({ [key]: value });
      } catch (err) {
        setPreferences(previous);
        setError(err instanceof Error ? err : new Error('Failed to update notification preference'));
      }
    },
    [preferences],
  );

  return {
    preferences,
    loading,
    error,
    updatePreference,
  };
}
