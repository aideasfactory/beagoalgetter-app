import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/supabase';
import { useSession } from '@/context/auth';
import type { MoodType } from '@/types/database.example';

interface CompleteDayParams {
  challengeId: string;
  challengeTitle: string;
  taskIds: string[];
  mood: MoodType | null;
  notes: string;
  imageUri: string | null;
}

interface CompleteDayResult {
  success: boolean;
  error?: string;
  newStreak?: number;
}

/**
 * Upload an image to Supabase storage and return the public URL.
 */
async function uploadProofImage(userId: string, imageUri: string): Promise<string> {
  const ext = imageUri.split('.').pop() || 'jpg';
  const mimeExt = ext === 'jpg' ? 'jpeg' : ext;
  const fileName = `${userId}/${Date.now()}.${ext}`;

  // Read the file as base64 and decode to ArrayBuffer for reliable RN upload
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(fileName, decode(base64), { contentType: `image/${mimeExt}` });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Get today's ISO 8601 day number (1=Monday, 7=Sunday).
 */
function getISODay(date: Date): string {
  const jsDay = date.getDay();
  return String(jsDay === 0 ? 7 : jsDay);
}

/**
 * Format date as YYYY-MM-DD string.
 */
function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Calculate the user's current streak for a challenge.
 *
 * Algorithm:
 * 1. Get all tasks and all completions for the user in this challenge
 * 2. Starting from yesterday, go backwards day by day
 * 3. For each day, determine available tasks (recurring by day-of-week, non-recurring if not yet completed before that day)
 * 4. Skip days with no available tasks
 * 5. Check if all required available tasks were completed that day
 * 6. If yes → streak++; if no → stop
 * 7. Also check today: if all available required tasks completed → include today in streak
 */
async function calculateStreak(
  challengeId: string,
  userId: string,
  challengeStartDate: string | null,
): Promise<number> {
  // Fetch all tasks and all completions
  const [tasksResult, completionsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, is_recurring, recurring_days, required, is_active')
      .eq('challenge_id', challengeId)
      .eq('is_active', true),
    supabase
      .from('task_completions')
      .select('task_id, completed_at')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .order('completed_at', { ascending: true }),
  ]);

  if (tasksResult.error || completionsResult.error) return 0;

  const tasks = tasksResult.data || [];
  const completions = completionsResult.data || [];

  if (tasks.length === 0) return 0;

  // Build a map of completions by date → set of task_ids
  const completionsByDate = new Map<string, Set<string>>();
  for (const c of completions) {
    const dateStr = toDateString(new Date(c.completed_at));
    if (!completionsByDate.has(dateStr)) {
      completionsByDate.set(dateStr, new Set());
    }
    completionsByDate.get(dateStr)!.add(c.task_id);
  }

  // Track non-recurring tasks that have been completed (for filtering)
  const nonRecurringCompletedBefore = new Map<string, string>(); // task_id → first completion date
  for (const c of completions) {
    const taskId = c.task_id;
    const dateStr = toDateString(new Date(c.completed_at));
    if (!nonRecurringCompletedBefore.has(taskId)) {
      nonRecurringCompletedBefore.set(taskId, dateStr);
    }
  }

  // Determine the start boundary
  const startBoundary = challengeStartDate
    ? new Date(challengeStartDate + 'T00:00:00')
    : new Date(completions.length > 0 ? completions[0].completed_at : Date.now());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const current = new Date(today);

  // Check up to 365 days back (reasonable limit)
  for (let i = 0; i < 365; i++) {
    if (current < startBoundary) break;

    const dateStr = toDateString(current);
    const dayISO = getISODay(current);

    // Get available tasks for this day
    const availableTasks = tasks.filter((task) => {
      if (task.is_recurring) {
        return task.recurring_days.includes(dayISO);
      } else {
        // Non-recurring: available if not completed before this date
        const firstCompletion = nonRecurringCompletedBefore.get(task.id);
        return !firstCompletion || firstCompletion === dateStr;
      }
    });

    // Get required available tasks
    const requiredTasks = availableTasks.filter((t) => t.required);

    // Skip days with no available required tasks
    if (requiredTasks.length === 0) {
      current.setDate(current.getDate() - 1);
      continue;
    }

    // Check if all required tasks were completed on this date
    const completedOnDate = completionsByDate.get(dateStr) || new Set();
    const allRequiredCompleted = requiredTasks.every((t) => completedOnDate.has(t.id));

    if (allRequiredCompleted) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      // For today specifically, don't break — just don't count today
      if (i === 0) {
        current.setDate(current.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

export function useCompleteDay() {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);

  const completeDay = useCallback(
    async (params: CompleteDayParams): Promise<CompleteDayResult> => {
      if (!user?.id) {
        return { success: false, error: 'Not authenticated' };
      }

      setLoading(true);

      try {
        // 1. Upload image if provided
        let imageUrl: string | null = null;
        if (params.imageUri) {
          imageUrl = await uploadProofImage(user.id, params.imageUri);
        }

        // 2. Create task_completion records for each task
        const completionRecords = params.taskIds.map((taskId) => ({
          task_id: taskId,
          user_id: user.id,
          challenge_id: params.challengeId,
          status: 'success' as const,
          mood: params.mood,
          notes: params.notes || null,
          proof_image_url: imageUrl,
        }));

        const { error: completionError } = await supabase
          .from('task_completions')
          .insert(completionRecords);

        if (completionError) throw completionError;

        // 3. Create a post record for the social feed
        const dayMessage = `Completed tasks for ${params.challengeTitle}`;
        const { error: postError } = await supabase.from('posts').insert({
          user_id: user.id,
          challenge_id: params.challengeId,
          message: dayMessage,
          type: 'success' as const,
          note: params.notes || null,
          image_url: imageUrl,
        });

        if (postError) throw postError;

        // 4. Calculate new streak and update challenge_participants
        const { data: challengeData } = await supabase
          .from('challenges')
          .select('start_date')
          .eq('id', params.challengeId)
          .single();

        const newStreak = await calculateStreak(
          params.challengeId,
          user.id,
          challengeData?.start_date || null,
        );

        // Read existing longest_streak, then do a single update
        const { data: participant } = await supabase
          .from('challenge_participants')
          .select('longest_streak')
          .eq('challenge_id', params.challengeId)
          .eq('user_id', user.id)
          .single();

        const existingLongest = participant?.longest_streak || 0;

        await supabase
          .from('challenge_participants')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, existingLongest),
          })
          .eq('challenge_id', params.challengeId)
          .eq('user_id', user.id);

        return { success: true, newStreak };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to complete day' };
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  return { completeDay, loading };
}
