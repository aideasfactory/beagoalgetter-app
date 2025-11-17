import { useCallback, useEffect, useState } from 'react';
import type { NotificationWithUser } from '@/types/database.example';
import { notificationService } from '@/services';

interface UseUserNotificationsResult {
  notifications: NotificationWithUser[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useUserNotifications(): UseUserNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [items, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);

      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationService.markAsRead(id);

        setNotifications((current) =>
          current.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        );

        setUnreadCount((current) => (current > 0 ? current - 1 : 0));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: load,
    markAsRead,
    markAllAsRead,
  };
}
