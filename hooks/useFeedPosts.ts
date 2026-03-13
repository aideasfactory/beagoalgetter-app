import { useCallback, useEffect, useState } from 'react';
import { postService } from '@/services';
import { supabase } from '@/supabase';
import type { Post } from '@/components/PostCard';
import type { PostWithDetails } from '@/types/database.example';

// Extends Post with groupId so index.tsx can fetch full group details on click
export interface FeedPost extends Post {
  groupId: string | null;
}

type TabType = 'all' | 'my-challenges';

interface UseFeedPostsResult {
  posts: FeedPost[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  handleLike: (postId: string, liked: boolean) => Promise<void>;
  updateCommentCount: (postId: string, delta: number) => void;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

function computeChallengeDay(
  startDate: string | null,
  postCreatedAt: string,
  duration: number,
  durationType: string,
): { current: number; total: number } | undefined {
  if (!startDate) return undefined;

  const start = new Date(startDate + 'T00:00:00');
  const postDate = new Date(postCreatedAt);
  const diffMs = postDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const totalDays = durationType === 'weeks' ? duration * 7 : duration;
  const currentDay = Math.max(1, Math.min(diffDays + 1, totalDays));

  return { current: currentDay, total: totalDays };
}

function mapPostToFeedPost(
  post: PostWithDetails,
  likedPostIds: Set<string>,
  currentUserId: string | null,
): FeedPost {
  const challengeType = post.challenge_type === 'personal' ? 'Personal' : 'Group';

  const group =
    post.group_name && post.group_logo && post.group_color
      ? {
          name: post.group_name,
          logo: post.group_logo,
          color: post.group_color,
        }
      : undefined;

  const challengeDay = computeChallengeDay(
    post.challenge_start_date,
    post.created_at,
    post.challenge_duration,
    post.challenge_duration_type,
  );

  return {
    id: post.id,
    user: {
      name: post.user_name || post.user_username || 'Member',
      avatar: post.user_avatar || '',
      streak: post.user_streak ?? 0,
      abilityPoints: post.user_ability_points ?? 0,
    },
    challenge: {
      id: post.challenge_id,
      name: post.challenge_title || 'Challenge',
      type: challengeType,
      members: post.challenge_participant_count ?? 0,
    },
    challengeDay,
    group,
    groupId: post.group_id ?? null,
    type: post.type as 'success' | 'fail' | 'joined',
    isChallengeComplete: post.is_challenge_complete ?? false,
    message: post.message,
    note: post.note ?? undefined,
    image: post.image_url ?? undefined,
    timestamp: formatRelativeTime(post.created_at),
    likes: post.likes_count ?? 0,
    abilityPointsGiven: post.ability_points_given ?? 0,
    commentsCount: post.comments_count ?? 0,
    isLiked: likedPostIds.has(post.id),
    isOwnPost: currentUserId != null && post.user_id === currentUserId,
  };
}

export function useFeedPosts(activeTab: TabType): UseFeedPostsResult {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [rawPosts, likedPostIds, { data: { user } }] = await Promise.all([
        activeTab === 'my-challenges'
          ? postService.getMyChallengePosts()
          : postService.getFeedPosts(),
        postService.getUserLikedPostIds(),
        supabase.auth.getUser(),
      ]);

      const currentUserId = user?.id ?? null;
      setPosts(rawPosts.map((p) => mapPostToFeedPost(p, likedPostIds, currentUserId)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load posts'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLike = useCallback(async (postId: string, liked: boolean) => {
    try {
      if (liked) {
        await postService.likePost(postId);
      } else {
        await postService.unlikePost(postId);
      }
    } catch {
      // Revert optimistic update on failure
      setPosts((current) =>
        current.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !liked,
                likes: liked ? p.likes - 1 : p.likes + 1,
              }
            : p,
        ),
      );
    }
  }, []);

  const updateCommentCount = useCallback((postId: string, delta: number) => {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: Math.max(0, p.commentsCount + delta) }
          : p,
      ),
    );
  }, []);

  const refetch = useCallback(() => load(true), [load]);

  return {
    posts,
    loading,
    refreshing,
    error,
    refetch,
    handleLike,
    updateCommentCount,
  };
}
