import { supabase } from '@/supabase';
import type { NotificationWithUser } from '@/types/database.example';

export const notificationService = {
  async getNotifications(): Promise<NotificationWithUser[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications_with_users')
      .select('*')
      .eq('user_id', user.id)
      .order('read', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data ?? []) as NotificationWithUser[];
  },

  async getUnreadCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return count ?? 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
  },
};
