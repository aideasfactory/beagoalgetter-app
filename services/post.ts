import { supabase } from '@/supabase';
import type { PostWithDetails } from '@/types/database.example';

export const postService = {
  async getFeedPosts(limit: number = 20): Promise<PostWithDetails[]> {
    const { data, error } = await supabase
      .from('posts_with_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as PostWithDetails[];
  },

  async getMyChallengePosts(limit: number = 20): Promise<PostWithDetails[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Step 1: Get challenge IDs the user is participating in
    const { data: participants, error: participantsError } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (participantsError) throw participantsError;

    const challengeIds = (participants ?? []).map((p) => p.challenge_id);
    if (challengeIds.length === 0) return [];

    // Step 2: Get posts filtered to those challenges
    const { data, error } = await supabase
      .from('posts_with_details')
      .select('*')
      .in('challenge_id', challengeIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as PostWithDetails[];
  },

  async getUserLikedPostIds(): Promise<Set<string>> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id);

    if (error) throw error;
    return new Set((data ?? []).map((row) => row.post_id));
  },

  async likePost(postId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id });

    if (error) throw error;
  },

  async unlikePost(postId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async giveAbilityPoints(postId: string, points: number): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_ability_points')
      .upsert(
        { post_id: postId, user_id: user.id, points },
        { onConflict: 'post_id,user_id' },
      );

    if (error) throw error;
  },

  async getChallengeDescription(challengeId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('description')
      .eq('id', challengeId)
      .single();

    if (error) throw error;
    return data?.description ?? null;
  },
};
