import { supabase } from '@/supabase';

interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  color: string | null;
  location: string | null;
  founded: string | null;
  member_count: number;
  cover_image_url: string | null;
  website: string | null;
  social_links: Record<string, string>;
  created_by: string | null;
}

export const groupService = {
  async getGroupById(groupId: string): Promise<GroupDetails | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data as GroupDetails | null;
  },

  async getGroupChallengeCount(groupId: string): Promise<number> {
    const { count, error } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count ?? 0;
  },
};
