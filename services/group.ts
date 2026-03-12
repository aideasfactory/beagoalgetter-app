import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/supabase';
import type { Group } from '@/types/database.example';

export interface CreateGroupInput {
  name: string;
  description: string;
  color: string;
  logo: string | null;
  member_count: number;
  founded: string | null;
  location: string | null;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  color?: string;
  logo?: string | null;
  member_count?: number;
  founded?: string | null;
  location?: string | null;
}

export const groupService = {
  async getGroupById(groupId: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data as Group | null;
  },

  async getGroupChallengeCount(groupId: string): Promise<number> {
    const { count, error } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count ?? 0;
  },

  async getMyGroups(): Promise<Group[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Group[];
  },

  async createGroup(input: CreateGroupInput): Promise<Group> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: input.name,
        description: input.description,
        color: input.color,
        logo: input.logo,
        member_count: input.member_count,
        founded: input.founded,
        location: input.location,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Group;
  },

  async updateGroup(groupId: string, updates: UpdateGroupInput): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data as Group;
  },

  async deleteGroup(groupId: string): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  async uploadGroupLogo(imageUri: string): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const ext = imageUri.split('.').pop() || 'jpg';
    const mimeExt = ext === 'jpg' ? 'jpeg' : ext;
    const fileName = `groups/${user.id}/${Date.now()}.${ext}`;

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error: uploadError } = await supabase.storage
      .from('challenge-images')
      .upload(fileName, decode(base64), {
        contentType: `image/${mimeExt}`,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('challenge-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },
};
