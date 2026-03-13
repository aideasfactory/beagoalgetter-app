import { supabase } from '@/supabase';
import type { PostWithDetails, ReactionType, PostCommentWithUser } from '@/types/database.example';

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

  async likePost(postId: string, reactionType: ReactionType = 'like'): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType });

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

  async getChallengePreviewData(
    challengeId: string,
  ): Promise<{
    description: string | null;
    duration: number;
    duration_type: 'days' | 'weeks';
    start_date: string | null;
  } | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('description, duration, duration_type, start_date')
      .eq('id', challengeId)
      .single();

    if (error) throw error;
    return data ?? null;
  },

  async getPostComments(postId: string): Promise<PostCommentWithUser[]> {
    // Fetch comments without profile join to avoid PostgREST relationship
    // resolution issues (post_comments.user_id → auth.users, not profiles)
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Batch-fetch profiles for all unique comment authors
    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, username')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p: any) => [p.id, p]),
    );

    return data.map((row) => {
      const profile = profileMap.get(row.user_id);
      return {
        id: row.id,
        post_id: row.post_id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.created_at,
        user_name: profile?.display_name ?? null,
        user_avatar: profile?.avatar_url ?? null,
        user_username: profile?.username ?? null,
      };
    });
  },

  async createComment(postId: string, content: string): Promise<PostCommentWithUser> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert and select only the comment columns (no join) to avoid
    // PostgREST relationship resolution issues with profiles:user_id
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('id, post_id, user_id, content, created_at')
      .single();

    if (error) throw error;

    // Fetch the user's profile separately for display info
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, username')
      .eq('id', user.id)
      .single();

    return {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      user_name: profile?.display_name ?? null,
      user_avatar: profile?.avatar_url ?? null,
      user_username: profile?.username ?? null,
    };
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },
};
