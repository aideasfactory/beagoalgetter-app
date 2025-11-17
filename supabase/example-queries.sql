-- ================================================
-- Goal Getter - Example Queries
-- ================================================
-- Useful queries for common operations in the app
-- ================================================

-- ================================================
-- USER & PROFILE QUERIES
-- ================================================

-- Get user profile with stats
SELECT 
    id,
    display_name,
    username,
    avatar_url,
    bio,
    longest_streak,
    total_ability_points,
    challenges_completed,
    active_challenges,
    total_challenges,
    is_premium,
    is_active
FROM profiles
WHERE id = 'USER_ID';

-- Search users by username or display name
SELECT id, username, display_name, avatar_url
FROM profiles
WHERE 
    username ILIKE '%search_term%' OR
    display_name ILIKE '%search_term%'
LIMIT 20;

-- Get top users by ability points
SELECT 
    display_name,
    username,
    avatar_url,
    total_ability_points,
    longest_streak
FROM profiles
ORDER BY total_ability_points DESC
LIMIT 10;

-- ================================================
-- CHALLENGE QUERIES
-- ================================================

-- Get all challenges with creator info
SELECT 
    c.*,
    p.display_name as creator_name,
    p.username as creator_username,
    COUNT(DISTINCT cp.user_id) as participant_count
FROM challenges c
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
GROUP BY c.id, p.display_name, p.username
ORDER BY c.created_at DESC;

-- Get challenges by type
SELECT * FROM challenges
WHERE type = 'personal'  -- or 'team', 'group'
ORDER BY created_at DESC;

-- Get user's active challenges
SELECT 
    c.*,
    cp.current_streak,
    cp.total_ability_points,
    cp.joined_at
FROM challenges c
INNER JOIN challenge_participants cp ON c.id = cp.challenge_id
WHERE cp.user_id = 'USER_ID'
ORDER BY cp.joined_at DESC;

-- Get challenge details with all info
SELECT 
    c.*,
    p.display_name as creator_name,
    g.name as group_name,
    g.logo as group_logo,
    g.color as group_color,
    COUNT(DISTINCT cp.user_id) as total_participants,
    COUNT(DISTINCT t.id) as total_tasks
FROM challenges c
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN groups g ON c.group_id = g.id
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id AND cp.status = 'active'
LEFT JOIN tasks t ON c.id = t.challenge_id AND t.is_active = true
WHERE c.id = 'CHALLENGE_ID'
GROUP BY c.id, p.display_name, g.name, g.logo, g.color;

-- ================================================
-- TASK QUERIES
-- ================================================

-- Get all tasks for a challenge (ordered)
SELECT * FROM tasks
WHERE challenge_id = 'CHALLENGE_ID'
ORDER BY order_index ASC;

-- Get user's task completions for a challenge
SELECT 
    t.id as task_id,
    t.title,
    t.description,
    tc.status,
    tc.notes,
    tc.ability_points_awarded,
    tc.completed_at
FROM tasks t
LEFT JOIN task_completions tc ON t.id = tc.task_id AND tc.user_id = 'USER_ID'
WHERE t.challenge_id = 'CHALLENGE_ID'
ORDER BY t.order_index ASC;

-- Get user's completion rate for a challenge
SELECT 
    COUNT(CASE WHEN tc.status = 'success' THEN 1 END) as completed_tasks,
    COUNT(t.id) as total_tasks,
    ROUND(
        COUNT(CASE WHEN tc.status = 'success' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(t.id), 0) * 100, 
        2
    ) as completion_percentage
FROM tasks t
LEFT JOIN task_completions tc ON t.id = tc.task_id AND tc.user_id = 'USER_ID'
WHERE t.challenge_id = 'CHALLENGE_ID';

-- Get today's recurring tasks for a user
SELECT DISTINCT t.*
FROM tasks t
INNER JOIN challenge_participants cp ON t.challenge_id = cp.challenge_id
WHERE 
    cp.user_id = 'USER_ID' AND
    t.is_recurring = true AND
    LOWER(TO_CHAR(NOW(), 'Day')) = ANY(
        SELECT LOWER(TRIM(day)) FROM unnest(t.recurring_days) AS day
    );

-- ================================================
-- LEADERBOARD QUERIES
-- ================================================

-- Get challenge leaderboard
SELECT 
    cp.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    cp.current_streak,
    cp.longest_streak,
    cp.total_ability_points,
    cp.status,
    t.name as team_name,
    t.color as team_color,
    RANK() OVER (ORDER BY cp.total_ability_points DESC, cp.current_streak DESC) as rank
FROM challenge_participants cp
LEFT JOIN profiles p ON cp.user_id = p.id
LEFT JOIN teams t ON cp.team_id = t.id
WHERE cp.challenge_id = 'CHALLENGE_ID' AND cp.status IN ('active', 'completed')
ORDER BY rank ASC;

-- Get team leaderboard for a group challenge
-- Teams belong to groups, so we filter participants by challenge and team
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.color as team_color,
    COUNT(cp.user_id) as member_count,
    SUM(cp.total_ability_points) as total_points,
    AVG(cp.current_streak) as avg_streak,
    RANK() OVER (ORDER BY SUM(cp.total_ability_points) DESC) as rank
FROM teams t
LEFT JOIN challenge_participants cp ON t.id = cp.team_id AND cp.challenge_id = 'CHALLENGE_ID' AND cp.status = 'active'
WHERE t.group_id = (SELECT group_id FROM challenges WHERE id = 'CHALLENGE_ID')
GROUP BY t.id, t.name, t.color
ORDER BY rank ASC;

-- ================================================
-- FEED / POSTS QUERIES
-- ================================================

-- Get feed posts with all details (use the view)
SELECT * FROM posts_with_details
ORDER BY created_at DESC
LIMIT 20;

-- Get feed posts for user's challenges only
SELECT p.*, posts_with_details.*
FROM posts p
INNER JOIN posts_with_details ON p.id = posts_with_details.id
WHERE p.challenge_id IN (
    SELECT challenge_id FROM challenge_participants
    WHERE user_id = 'USER_ID'
)
ORDER BY p.created_at DESC
LIMIT 20;

-- Get posts by a specific user
SELECT * FROM posts_with_details
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;

-- Get posts for a specific challenge
SELECT * FROM posts_with_details
WHERE challenge_id = 'CHALLENGE_ID'
ORDER BY created_at DESC;

-- Check if user liked a post
SELECT EXISTS(
    SELECT 1 FROM post_likes
    WHERE post_id = 'POST_ID' AND user_id = 'USER_ID'
) as user_has_liked;

-- Get users who liked a post
SELECT 
    p.display_name,
    p.username,
    p.avatar_url,
    pl.created_at
FROM post_likes pl
INNER JOIN profiles p ON pl.user_id = p.id
WHERE pl.post_id = 'POST_ID'
ORDER BY pl.created_at DESC;

-- ================================================
-- NOTIFICATION QUERIES
-- ================================================

-- Get user's notifications (unread first)
SELECT 
    n.*,
    p.display_name as from_user_name,
    p.avatar_url as from_user_avatar
FROM notifications n
LEFT JOIN profiles p ON n.from_user_id = p.id
WHERE n.user_id = 'USER_ID'
ORDER BY n.read ASC, n.created_at DESC
LIMIT 50;

-- Get unread notification count
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = 'USER_ID' AND read = false;

-- Mark notification as read
UPDATE notifications
SET read = true
WHERE id = 'NOTIFICATION_ID' AND user_id = 'USER_ID';

-- Mark all notifications as read
UPDATE notifications
SET read = true
WHERE user_id = 'USER_ID' AND read = false;

-- ================================================
-- GROUP QUERIES
-- ================================================

-- Get all groups
SELECT 
    g.*,
    p.display_name as creator_name,
    COUNT(DISTINCT c.id) as challenge_count
FROM groups g
LEFT JOIN profiles p ON g.created_by = p.id
LEFT JOIN challenges c ON g.id = c.group_id
GROUP BY g.id, p.display_name
ORDER BY g.created_at DESC;

-- Get group details with stats
SELECT 
    g.*,
    p.display_name as creator_name,
    COUNT(DISTINCT c.id) as total_challenges,
    COUNT(DISTINCT cp.user_id) as total_members
FROM groups g
LEFT JOIN profiles p ON g.created_by = p.id
LEFT JOIN challenges c ON g.id = c.group_id
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
WHERE g.id = 'GROUP_ID'
GROUP BY g.id, p.display_name;

-- ================================================
-- STATISTICS QUERIES
-- ================================================

-- Get user's overall stats
SELECT 
    p.longest_streak,
    p.total_ability_points,
    p.challenges_completed,
    p.active_challenges,
    p.total_challenges,
    COUNT(DISTINCT po.id) as total_posts,
    SUM(po.likes_count) as total_likes_received
FROM profiles p
LEFT JOIN posts po ON p.id = po.user_id
WHERE p.id = 'USER_ID'
GROUP BY p.id, p.longest_streak, p.total_ability_points, p.challenges_completed, p.active_challenges, p.total_challenges;

-- Get challenge completion stats
SELECT 
    c.title,
    COUNT(DISTINCT cp.user_id) as total_participants,
    COUNT(DISTINCT tc.id) as total_completions,
    COUNT(DISTINCT CASE WHEN tc.status = 'success' THEN tc.id END) as successful_completions,
    COUNT(DISTINCT CASE WHEN tc.status = 'fail' THEN tc.id END) as failed_completions,
    ROUND(
        COUNT(DISTINCT CASE WHEN tc.status = 'success' THEN tc.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT tc.id), 0) * 100,
        2
    ) as success_rate
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
LEFT JOIN task_completions tc ON c.id = tc.challenge_id
WHERE c.id = 'CHALLENGE_ID'
GROUP BY c.id, c.title;

-- Get daily activity for a challenge
SELECT 
    DATE(tc.completed_at) as date,
    COUNT(*) as total_completions,
    COUNT(CASE WHEN tc.status = 'success' THEN 1 END) as successful,
    COUNT(CASE WHEN tc.status = 'fail' THEN 1 END) as failed
FROM task_completions tc
WHERE tc.challenge_id = 'CHALLENGE_ID'
GROUP BY DATE(tc.completed_at)
ORDER BY date DESC
LIMIT 30;

-- ================================================
-- MUTATION QUERIES (INSERT/UPDATE/DELETE)
-- ================================================

-- Create a new challenge
INSERT INTO challenges (
    title, 
    description, 
    type, 
    duration, 
    duration_type, 
    created_by,
    image_url
) VALUES (
    'My Challenge',
    'Challenge description',
    'personal',
    30,
    'days',
    'USER_ID',
    'https://example.com/image.jpg'
) RETURNING *;

-- Join a challenge
INSERT INTO challenge_participants (
    challenge_id,
    user_id
) VALUES (
    'CHALLENGE_ID',
    'USER_ID'
) RETURNING *;

-- Complete a task
INSERT INTO task_completions (
    task_id,
    user_id,
    challenge_id,
    status,
    notes,
    ability_points_awarded
) VALUES (
    'TASK_ID',
    'USER_ID',
    'CHALLENGE_ID',
    'success',
    'Felt great today!',
    10
) RETURNING *;

-- Create a post
INSERT INTO posts (
    user_id,
    challenge_id,
    message,
    note,
    image_url,
    type
) VALUES (
    'USER_ID',
    'CHALLENGE_ID',
    'Completed today''s workout!',
    'Did 50 push-ups',
    'https://example.com/post-image.jpg',
    'success'
) RETURNING *;

-- Like a post
INSERT INTO post_likes (post_id, user_id)
VALUES ('POST_ID', 'USER_ID')
ON CONFLICT (post_id, user_id) DO NOTHING
RETURNING *;

-- Unlike a post
DELETE FROM post_likes
WHERE post_id = 'POST_ID' AND user_id = 'USER_ID';

-- Give ability points to a post
UPDATE posts
SET ability_points_given = ability_points_given + 5
WHERE id = 'POST_ID'
RETURNING *;

-- Update user profile
UPDATE profiles
SET 
    display_name = 'New Name',
    bio = 'New bio',
    avatar_url = 'https://example.com/avatar.jpg'
WHERE id = 'USER_ID'
RETURNING *;

-- Update participant streak and points
UPDATE challenge_participants
SET 
    current_streak = current_streak + 1,
    total_ability_points = total_ability_points + 10
WHERE challenge_id = 'CHALLENGE_ID' AND user_id = 'USER_ID'
RETURNING *;

-- ================================================
-- CLEANUP QUERIES (Use with caution!)
-- ================================================

-- Delete a challenge (cascades to tasks, participants, etc.)
DELETE FROM challenges
WHERE id = 'CHALLENGE_ID' AND created_by = 'USER_ID';

-- Leave a challenge
DELETE FROM challenge_participants
WHERE challenge_id = 'CHALLENGE_ID' AND user_id = 'USER_ID';

-- Delete a post
DELETE FROM posts
WHERE id = 'POST_ID' AND user_id = 'USER_ID';

-- Clear all notifications for a user
DELETE FROM notifications
WHERE user_id = 'USER_ID';

-- ================================================
-- PERFORMANCE ANALYSIS
-- ================================================

-- Check query performance (run EXPLAIN ANALYZE before your query)
EXPLAIN ANALYZE
SELECT * FROM posts_with_details
ORDER BY created_at DESC
LIMIT 20;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
