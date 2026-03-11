import { useState } from 'react';
import { supabase } from '@/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export interface TaskDocument {
  url: string;
  name: string;
}

interface TaskInput {
  id: string;
  title: string;
  items: string[];
  isRecurring: boolean;
  days: string[];
  documents: TaskDocument[];
  youtubeLinks: string[];
}

interface CreateChallengeInput {
  title: string;
  description: string;
  duration: string;
  durationType: 'days' | 'weeks';
  startDate: Date;
  challengeType: 'personal' | 'group';
  selectedGroup: string | null;
  imageUrl: string | null;
  tasks: TaskInput[];
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function computeEndDate(startDate: Date, duration: number, durationType: 'days' | 'weeks'): string {
  const end = new Date(startDate);
  const daysToAdd = durationType === 'weeks' ? duration * 7 : duration;
  end.setDate(end.getDate() + daysToAdd);
  return end.toISOString().split('T')[0];
}

export function useCreateChallenge() {
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const uploadChallengeImage = async (localUri: string): Promise<string> => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = localUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from('challenge-images')
        .upload(fileName, decode(base64), {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('challenge-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadTaskDocument = async (localUri: string, fileName: string, mimeType: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    const storagePath = `${user.id}/${Date.now()}.${fileExt}`;

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error: uploadError } = await supabase.storage
      .from('task-documents')
      .upload(storagePath, decode(base64), {
        contentType: mimeType || 'application/octet-stream',
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('task-documents')
      .getPublicUrl(storagePath);

    return data.publicUrl;
  };

  const createChallenge = async (input: CreateChallengeInput): Promise<{ id: string; joinCode: string }> => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const duration = parseInt(input.duration);
      const startDateStr = input.startDate.toISOString().split('T')[0];
      const endDateStr = computeEndDate(input.startDate, duration, input.durationType);

      // Generate unique join code
      let joinCode = generateJoinCode();
      const { data: existing } = await supabase
        .from('challenges')
        .select('id')
        .eq('join_code', joinCode)
        .maybeSingle();

      if (existing) {
        joinCode = generateJoinCode();
      }

      // 1. Insert challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          title: input.title,
          description: input.description || null,
          type: input.challengeType,
          duration,
          duration_type: input.durationType,
          start_date: startDateStr,
          end_date: endDateStr,
          status: 'active',
          join_code: joinCode,
          image_url: input.imageUrl,
          created_by: user.id,
          group_id: input.selectedGroup || null,
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // 2. Insert tasks
      const validTasks = input.tasks.filter(t => t.items.length > 0);

      if (validTasks.length > 0) {
        const taskRows = validTasks.map((task, index) => {
          const attachments: Array<{ type: string; url: string; name?: string }> = [];

          task.documents.forEach(doc => {
            attachments.push({ type: 'document', url: doc.url, name: doc.name });
          });

          task.youtubeLinks.forEach(link => {
            attachments.push({ type: 'youtube', url: link });
          });

          const items = task.items.map((itemTitle, i) => ({
            id: `${Date.now()}-${i}`,
            title: itemTitle,
            completed: false,
          }));

          return {
            challenge_id: challenge.id,
            title: task.title?.trim() || `Task ${index + 1}`,
            description: null,
            is_recurring: task.isRecurring,
            recurring_days: task.days,
            order_index: index,
            items,
            attachments,
          };
        });

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(taskRows);

        if (tasksError) throw tasksError;
      }

      // 3. Auto-join creator as participant
      const { error: participantError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          status: 'active',
        });

      if (participantError) throw participantError;

      return { id: challenge.id, joinCode: joinCode };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    uploadChallengeImage,
    uploadTaskDocument,
    createChallenge,
    isUploading,
    isCreating,
  };
}
