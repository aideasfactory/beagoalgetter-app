import { useCallback, useEffect, useState } from 'react';
import { postService } from '@/services';
import { supabase } from '@/supabase';
import type { PostCommentWithUser } from '@/types/database.example';

interface UsePostCommentsResult {
  comments: PostCommentWithUser[];
  loading: boolean;
  submitting: boolean;
  currentUserId: string | null;
  addComment: (content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

export function usePostComments(postId: string | null): UsePostCommentsResult {
  const [comments, setComments] = useState<PostCommentWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setComments([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [data, { data: { user } }] = await Promise.all([
          postService.getPostComments(postId),
          supabase.auth.getUser(),
        ]);
        if (!cancelled) {
          setComments(data);
          setCurrentUserId(user?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setComments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const addComment = useCallback(
    async (content: string) => {
      if (!postId || !content.trim()) return;
      setSubmitting(true);
      try {
        const newComment = await postService.createComment(postId, content.trim());
        setComments((prev) => [...prev, newComment]);
      } finally {
        setSubmitting(false);
      }
    },
    [postId],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await postService.deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch {
        // Deletion failed silently
      }
    },
    [],
  );

  return { comments, loading, submitting, currentUserId, addComment, deleteComment };
}
