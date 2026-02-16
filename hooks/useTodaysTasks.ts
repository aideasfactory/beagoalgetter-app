import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase';
import { useSession } from '@/context/auth';
import type { TaskChecklistItem, TaskAttachment } from '@/types/database.example';

export interface TodayTask {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  completed: boolean;
  items: TaskChecklistItem[];
  attachments: TaskAttachment[];
}

interface RawTask {
  id: string;
  title: string;
  description: string | null;
  is_recurring: boolean;
  recurring_days: string[];
  required: boolean;
  items: any;
  attachments: any;
  is_active: boolean;
}

interface RawCompletion {
  id: string;
  task_id: string;
}

/**
 * Get today's ISO 8601 day number (1=Monday, 7=Sunday).
 */
function getTodayISODay(): string {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isoDay = jsDay === 0 ? 7 : jsDay; // 1=Mon, ..., 7=Sun
  return String(isoDay);
}

/**
 * Get the UTC start and end of today in the user's local timezone.
 * This ensures correct filtering when completed_at is stored as UTC.
 */
function getTodayUTCRange(): { start: string; end: string } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  return {
    start: todayStart.toISOString(),
    end: tomorrowStart.toISOString(),
  };
}

/**
 * Filter tasks to those available today:
 * - Recurring tasks: today's day-of-week must be in recurring_days
 * - Non-recurring tasks: included if not yet completed in the challenge
 */
function filterTodaysTasks(
  tasks: RawTask[],
  completedTaskIds: Set<string>,
  allCompletionTaskIds: Set<string>,
): TodayTask[] {
  const todayDay = getTodayISODay();

  return tasks
    .filter((task) => {
      if (!task.is_active) return false;

      if (task.is_recurring) {
        // Recurring: check if today's day is in recurring_days
        return task.recurring_days.includes(todayDay);
      } else {
        // Non-recurring: show if never completed in this challenge
        return !allCompletionTaskIds.has(task.id);
      }
    })
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      required: task.required,
      completed: completedTaskIds.has(task.id),
      items: Array.isArray(task.items) ? task.items : [],
      attachments: Array.isArray(task.attachments) ? task.attachments : [],
    }));
}

export function useTodaysTasks(challengeId: string) {
  const { user } = useSession();
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!challengeId || !user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { start: todayStart, end: todayEnd } = getTodayUTCRange();

      // Fetch tasks and today's completions in parallel
      const [tasksResult, todayCompletionsResult, allCompletionsResult] = await Promise.all([
        // All active tasks for this challenge
        supabase
          .from('tasks')
          .select('id, title, description, is_recurring, recurring_days, required, items, attachments, is_active')
          .eq('challenge_id', challengeId)
          .eq('is_active', true)
          .order('order_index', { ascending: true }),
        // Today's completions for this user (using UTC range for correct timezone handling)
        supabase
          .from('task_completions')
          .select('id, task_id')
          .eq('challenge_id', challengeId)
          .eq('user_id', user.id)
          .gte('completed_at', todayStart)
          .lt('completed_at', todayEnd),
        // All completions for non-recurring task filtering
        supabase
          .from('task_completions')
          .select('task_id')
          .eq('challenge_id', challengeId)
          .eq('user_id', user.id),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (todayCompletionsResult.error) throw todayCompletionsResult.error;

      const rawTasks = (tasksResult.data || []) as RawTask[];
      const todayCompletedIds = new Set(
        ((todayCompletionsResult.data || []) as RawCompletion[]).map((c) => c.task_id),
      );
      const allCompletedIds = new Set(
        ((allCompletionsResult.data || []) as { task_id: string }[]).map((c) => c.task_id),
      );

      const todaysTasks = filterTodaysTasks(rawTasks, todayCompletedIds, allCompletedIds);
      setTasks(todaysTasks);
    } catch (err: any) {
      setError(err?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [challengeId, user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const hasTasks = tasks.length > 0;

  return {
    tasks,
    loading,
    error,
    completedCount,
    totalCount,
    hasTasks,
    refetch: fetchTasks,
  };
}
