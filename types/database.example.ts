/**
 * Database Types Example
 * 
 * This file shows how to use Supabase types in your React Native app.
 * 
 * To generate actual types from your database:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 */

import { supabase } from '@/supabase';

// ================================================
// Type Definitions (Example)
// ================================================

export type ChallengeType = 'personal' | 'team' | 'group';
export type DurationType = 'days' | 'weeks';
export type CompletionStatus = 'success' | 'fail';
export type NotificationType = 'like' | 'points' | 'challenge' | 'streak';

// Database Tables
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  username: string | null;
  total_streaks: number;
  total_ability_points: number;
  challenges_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  logo_emoji: string | null;
  color: string | null;
  location: string | null;
  founded: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  duration: number;
  duration_type: DurationType;
  group_id: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  challenge_id: string;
  title: string;
  description: string | null;
  is_recurring: boolean;
  recurring_days: string[];
  order_index: number;
  created_at: string;
}

export interface Team {
  id: string;
  challenge_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  team_id: string | null;
  joined_at: string;
  current_streak: number;
  total_ability_points: number;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
  notes: string | null;
  ability_points_awarded: number;
  status: CompletionStatus;
}

export interface Post {
  id: string;
  user_id: string;
  challenge_id: string;
  message: string;
  note: string | null;
  image_url: string | null;
  type: CompletionStatus;
  created_at: string;
  likes_count: number;
  ability_points_given: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  from_user_id: string | null;
  post_id: string | null;
  read: boolean;
  created_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// Extended types with joins
export interface PostWithDetails extends Post {
  user_name: string;
  user_avatar: string;
  user_username: string;
  challenge_title: string;
  challenge_type: ChallengeType;
  group_name: string | null;
  group_logo: string | null;
  group_color: string | null;
}

export interface ChallengeWithDetails extends Challenge {
  creator_name: string;
  group_name: string | null;
  participant_count: number;
  task_count: number;
}

export interface LeaderboardEntry extends ChallengeParticipant {
  display_name: string;
  avatar_url: string;
  username: string;
  team_name: string | null;
  team_color: string | null;
  rank: number;
}

export interface NotificationWithUser extends Notification {
  from_user_display_name: string | null;
  from_user_avatar_url: string | null;
  from_user_username: string | null;
}

// ================================================
// API Service Examples
// ================================================

/**
 * Profile Service
 */
export const profileService = {
  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile
   */
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },
};

/**
 * Challenge Service
 */
export const challengeService = {
  /**
   * Get all challenges
   */
  async getAllChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get challenge by ID with details
   */
  async getChallengeById(id: string): Promise<ChallengeWithDetails | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        creator:profiles!created_by(display_name),
        group:groups(name),
        participants:challenge_participants(count),
        tasks(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create challenge
   */
  async createChallenge(challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<Challenge> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        ...challenge,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Join challenge
   */
  async joinChallenge(challengeId: string): Promise<ChallengeParticipant> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Leave challenge
   */
  async leaveChallenge(challengeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('challenge_participants')
      .delete()
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Get user's challenges
   */
  async getMyChallenges(): Promise<Challenge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_participants!inner(user_id)
      `)
      .eq('challenge_participants.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

/**
 * Task Service
 */
export const taskService = {
  /**
   * Get tasks for a challenge
   */
  async getChallengeTasks(challengeId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Complete a task
   */
  async completeTask(
    taskId: string,
    challengeId: string,
    status: CompletionStatus,
    notes?: string,
    abilityPoints: number = 10
  ): Promise<TaskCompletion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('task_completions')
      .insert({
        task_id: taskId,
        user_id: user.id,
        challenge_id: challengeId,
        status,
        notes,
        ability_points_awarded: abilityPoints,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user's task completions for a challenge
   */
  async getUserCompletions(challengeId: string): Promise<TaskCompletion[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

/**
 * Post Service
 */
export const postService = {
  /**
   * Get feed posts
   */
  async getFeedPosts(limit: number = 20): Promise<PostWithDetails[]> {
    const { data, error } = await supabase
      .from('posts_with_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get posts for user's challenges only
   */
  async getMyChallengePosts(limit: number = 20): Promise<PostWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('posts_with_details')
      .select(`
        *,
        challenges!inner(
          challenge_participants!inner(user_id)
        )
      `)
      .eq('challenges.challenge_participants.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Create post
   */
  async createPost(
    challengeId: string,
    message: string,
    type: CompletionStatus,
    note?: string,
    imageUrl?: string
  ): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        message,
        type,
        note,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) throw error;
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Check if user liked a post
   */
  async hasUserLiked(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    return !!data;
  },
};

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Get user's notifications
   */
  async getNotifications(): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('read', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
  },
};

/**
 * Leaderboard Service
 */
export const leaderboardService = {
  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('challenge_leaderboard')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('rank', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

// ================================================
// React Hooks Examples
// ================================================

/**
 * Example: useChallenges hook
 */
export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    try {
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  return { challenges, loading, refetch: loadChallenges };
}

/**
 * Example: useProfile hook
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  return { profile, loading, refetch: loadProfile };
}

// ================================================
// Real-time Subscriptions Example
// ================================================

/**
 * Subscribe to new posts in feed
 */
export function subscribeToNewPosts(callback: (post: Post) => void) {
  const channel = supabase
    .channel('posts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      },
      (payload) => {
        callback(payload.new as Post);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ================================================
// Storage Helper
// ================================================

/**
 * Upload avatar image
 */
export async function uploadAvatar(userId: string, file: File | Blob): Promise<string> {
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Upload challenge image
 */
export async function uploadChallengeImage(file: File | Blob): Promise<string> {
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const fileName = `${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('challenge-images')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('challenge-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Upload post image
 */
export async function uploadPostImage(file: File | Blob): Promise<string> {
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const fileName = `${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
