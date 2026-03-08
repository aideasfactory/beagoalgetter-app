import { supabase } from '@/supabase';
import type { NotificationPreferences } from '@/types/database.example';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push_enabled: true,
  achievement_alerts: true,
  team_updates: true,
};

export const notificationPreferencesService = {
  async getPreferences(): Promise<NotificationPreferences> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    const raw = data?.notification_preferences as Partial<NotificationPreferences> | null;

    return {
      push_enabled: raw?.push_enabled ?? DEFAULT_PREFERENCES.push_enabled,
      achievement_alerts: raw?.achievement_alerts ?? DEFAULT_PREFERENCES.achievement_alerts,
      team_updates: raw?.team_updates ?? DEFAULT_PREFERENCES.team_updates,
    };
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };

    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: updated })
      .eq('id', user.id);

    if (error) throw error;

    return updated;
  },
};
