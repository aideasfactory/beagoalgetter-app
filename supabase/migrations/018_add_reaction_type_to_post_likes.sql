-- Migration 018: Add reaction_type to post_likes + 'encourage' notification type
-- Enables post-type-specific reactions: like (heart), celebrate (ribbon), encourage (strength)

-- 1. Add reaction_type column to post_likes (backward-compatible, defaults to 'like')
ALTER TABLE post_likes
  ADD COLUMN reaction_type TEXT NOT NULL DEFAULT 'like'
  CHECK (reaction_type IN ('like', 'celebrate', 'encourage'));

-- 2. Add 'encourage' to notification_type enum for future push notifications
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'encourage';

-- 3. Index on reaction_type for potential future queries (e.g. "who celebrated my post")
CREATE INDEX idx_post_likes_reaction_type ON post_likes (reaction_type);
