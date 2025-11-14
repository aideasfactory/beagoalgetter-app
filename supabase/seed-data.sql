-- ================================================
-- Goal Getter - Seed Data for Testing
-- ================================================
-- Sample data for development and testing
-- Run this AFTER running schema.sql
-- ================================================

-- Note: Replace 'YOUR_USER_ID' with actual user IDs from auth.users
-- Or run this after signing up test users in the app

-- ================================================
-- SAMPLE USERS (Profiles)
-- ================================================

-- These will be created automatically via trigger when users sign up
-- But you can manually insert profiles for testing:

-- Example: Insert test profiles (if users exist in auth.users)
-- Make sure these IDs match real auth.users IDs

/*
INSERT INTO profiles (id, display_name, username, avatar_url, bio, total_streaks, total_ability_points, challenges_completed)
VALUES 
    ('user-id-1', 'Alex Johnson', 'alexj', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'Fitness enthusiast and goal setter', 15, 245, 3),
    ('user-id-2', 'Sam Rodriguez', 'samr', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', 'Always up for a challenge', 22, 380, 5),
    ('user-id-3', 'Jordan Lee', 'jordanl', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', 'Consistency is key', 10, 150, 2)
ON CONFLICT (id) DO NOTHING;
*/

-- ================================================
-- SAMPLE GROUPS
-- ================================================

INSERT INTO groups (id, name, description, logo_emoji, color, location, founded, created_by)
VALUES 
    (
        'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d',
        'Iron Warriors Gym',
        'A community of dedicated fitness enthusiasts pushing their limits every day',
        '💪',
        '#00c2ff',
        'New York, NY',
        '2023',
        NULL  -- Replace with actual user ID
    ),
    (
        'b2c3d4e5-f6a7-4b5c-8d9e-6f7a5b4c3d2e',
        'Morning Runners Club',
        'Early risers who love to run before sunrise',
        '🏃',
        '#ef4444',
        'Los Angeles, CA',
        '2024',
        NULL
    ),
    (
        'c3d4e5f6-a7b8-4c5d-9e8f-7a6b5c4d3e2f',
        'Mindful Meditation Group',
        'Finding peace and clarity through daily meditation',
        '🧘',
        '#8b5cf6',
        'Austin, TX',
        '2023',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- SAMPLE CHALLENGES
-- ================================================

INSERT INTO challenges (id, title, description, type, duration, duration_type, group_id, image_url, created_by)
VALUES 
    -- Personal challenge
    (
        'd4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a',
        '30-Day Push-up Challenge',
        'Build upper body strength by doing push-ups every day for 30 days. Start with your baseline and progressively increase reps.',
        'personal',
        30,
        'days',
        NULL,
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        NULL  -- Replace with actual user ID
    ),
    -- Group challenge
    (
        'e5f6a7b8-c9d1-4e5f-9a8b-7c6d5e4f3a2b',
        'Iron Warriors Monthly Marathon',
        'Complete 100 miles of running collectively as a group this month. Every mile counts!',
        'group',
        30,
        'days',
        'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d',
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
        NULL
    ),
    -- Team challenge
    (
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Team Transformation: 8-Week Fitness Sprint',
        'Two teams compete to see who can achieve the most consistent workout routine over 8 weeks',
        'team',
        8,
        'weeks',
        NULL,
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        NULL
    ),
    -- Another personal challenge
    (
        'a7b8c9d1-e2f3-4a5b-9c8d-7e6f5a4b3c2d',
        'Daily Meditation Practice',
        'Meditate for at least 10 minutes every day to improve focus and reduce stress',
        'personal',
        21,
        'days',
        'c3d4e5f6-a7b8-4c5d-9e8f-7a6b5c4d3e2f',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- SAMPLE TASKS
-- ================================================

-- Tasks for 30-Day Push-up Challenge
INSERT INTO tasks (challenge_id, title, description, is_recurring, recurring_days, order_index)
VALUES 
    (
        'd4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a',
        'Daily Push-ups',
        'Complete your target number of push-ups. Increase by 2 reps each week.',
        true,
        ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        1
    ),
    (
        'd4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a',
        'Weekly Progress Photo',
        'Take a progress photo to track your physical transformation',
        true,
        ARRAY['sunday'],
        2
    );

-- Tasks for Iron Warriors Monthly Marathon
INSERT INTO tasks (challenge_id, title, description, is_recurring, recurring_days, order_index)
VALUES 
    (
        'e5f6a7b8-c9d1-4e5f-9a8b-7c6d5e4f3a2b',
        'Log Your Miles',
        'Run and log your distance. Every mile contributes to the group goal!',
        true,
        ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        1
    ),
    (
        'e5f6a7b8-c9d1-4e5f-9a8b-7c6d5e4f3a2b',
        'Share Your Route',
        'Post a screenshot or photo from your run',
        false,
        ARRAY[]::text[],
        2
    );

-- Tasks for Team Transformation
INSERT INTO tasks (challenge_id, title, description, is_recurring, recurring_days, order_index)
VALUES 
    (
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Strength Training',
        'Complete a full-body strength workout',
        true,
        ARRAY['monday', 'wednesday', 'friday'],
        1
    ),
    (
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Cardio Session',
        '30+ minutes of cardio exercise',
        true,
        ARRAY['tuesday', 'thursday', 'saturday'],
        2
    ),
    (
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Active Recovery',
        'Light activity like walking, yoga, or stretching',
        true,
        ARRAY['sunday'],
        3
    );

-- Tasks for Daily Meditation
INSERT INTO tasks (challenge_id, title, description, is_recurring, recurring_days, order_index)
VALUES 
    (
        'a7b8c9d1-e2f3-4a5b-9c8d-7e6f5a4b3c2d',
        'Morning Meditation',
        'Meditate for 10-15 minutes in the morning',
        true,
        ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        1
    ),
    (
        'a7b8c9d1-e2f3-4a5b-9c8d-7e6f5a4b3c2d',
        'Gratitude Journaling',
        'Write down 3 things you are grateful for',
        true,
        ARRAY['sunday'],
        2
    );

-- ================================================
-- SAMPLE TEAMS (for Team Transformation challenge)
-- ================================================

INSERT INTO teams (id, challenge_id, name, color)
VALUES 
    (
        'b8c9d1e2-f3a4-4b5c-9d8e-7f6a5b4c3d2e',
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Team Alpha',
        '#00c2ff'
    ),
    (
        'c9d1e2f3-a4b5-4c5d-8e9f-7a6b5c4d3e2f',
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Team Beta',
        '#ef4444'
    )
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- SAMPLE CHALLENGE PARTICIPANTS
-- ================================================

-- Note: Replace with actual user IDs
-- Format: (challenge_id, user_id, team_id, current_streak, total_ability_points)

/*
INSERT INTO challenge_participants (challenge_id, user_id, team_id, current_streak, total_ability_points)
VALUES 
    -- User 1 in Push-up Challenge
    ('d4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a', 'user-id-1', NULL, 5, 50),
    -- User 2 in Push-up Challenge
    ('d4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a', 'user-id-2', NULL, 8, 80),
    -- User 1 in Iron Warriors Marathon (group challenge)
    ('e5f6a7b8-c9d1-4e5f-9a8b-7c6d5e4f3a2b', 'user-id-1', NULL, 12, 120),
    -- User 3 in Iron Warriors Marathon
    ('e5f6a7b8-c9d1-4e5f-9a8b-7c6d5e4f3a2b', 'user-id-3', NULL, 10, 100),
    -- User 1 in Team Transformation (Team Alpha)
    ('f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c', 'user-id-1', 'b8c9d1e2-f3a4-4b5c-9d8e-7f6a5b4c3d2e', 15, 150),
    -- User 2 in Team Transformation (Team Beta)
    ('f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c', 'user-id-2', 'c9d1e2f3-a4b5-4c5d-8e9f-7a6b5c4d3e2f', 14, 140),
    -- User 3 in Meditation Challenge
    ('a7b8c9d1-e2f3-4a5b-9c8d-7e6f5a4b3c2d', 'user-id-3', NULL, 7, 70)
ON CONFLICT (challenge_id, user_id) DO NOTHING;
*/

-- ================================================
-- SAMPLE POSTS
-- ================================================

-- Note: Uncomment and replace with actual user IDs after creating users

/*
INSERT INTO posts (user_id, challenge_id, message, note, image_url, type, likes_count, ability_points_given)
VALUES 
    (
        'user-id-1',
        'd4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a',
        'Completed day 5 of push-ups! Feeling stronger already! 💪',
        'Did 25 push-ups today, up from 20 on day 1',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'success',
        5,
        15
    ),
    (
        'user-id-2',
        'd4e5f6a7-b8c9-4d5e-8f9a-7b6c5d4e3f2a',
        'Almost there! Day 8 complete 🔥',
        'Form is getting better every day',
        NULL,
        'success',
        3,
        10
    ),
    (
        'user-id-1',
        'e5f6a7b8-c9d1-4e5f-9a8b-7c6d5e4f3a2b',
        'Just logged 5 miles for the Iron Warriors! Beautiful morning run 🌅',
        'Central Park loop, perfect weather',
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
        'success',
        8,
        20
    ),
    (
        'user-id-3',
        'a7b8c9d1-e2f3-4a5b-9c8d-7e6f5a4b3c2d',
        'Week 1 of meditation complete! Feeling more centered',
        'Using Headspace app, 15 min sessions',
        NULL,
        'success',
        4,
        12
    ),
    (
        'user-id-2',
        'f6a7b8c9-d1e2-4f5a-8b9c-7d6e5f4a3b2c',
        'Tough workout today but Team Beta is crushing it! 🏆',
        'Deadlifts, squats, and bench press',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        'success',
        10,
        25
    );
*/

-- ================================================
-- SAMPLE NOTIFICATIONS
-- ================================================

/*
INSERT INTO notifications (user_id, type, message, from_user_id, post_id, read)
VALUES 
    (
        'user-id-1',
        'like',
        'Sam Rodriguez liked your post',
        'user-id-2',
        'post-id-1',
        false
    ),
    (
        'user-id-1',
        'points',
        'You received 5 ability points from Jordan Lee',
        'user-id-3',
        'post-id-1',
        false
    ),
    (
        'user-id-2',
        'streak',
        'Congratulations! You reached a 10-day streak! 🔥',
        NULL,
        NULL,
        false
    ),
    (
        'user-id-3',
        'challenge',
        'You were invited to join "Team Transformation"',
        'user-id-1',
        NULL,
        false
    );
*/

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- After running seed data, verify with these queries:

-- Count records in each table
SELECT 
    'groups' as table_name, COUNT(*) as count FROM groups
UNION ALL
SELECT 'challenges', COUNT(*) FROM challenges
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'teams', COUNT(*) FROM teams;

-- View created challenges with details
SELECT 
    c.title,
    c.type,
    c.duration,
    c.duration_type,
    g.name as group_name,
    COUNT(t.id) as task_count
FROM challenges c
LEFT JOIN groups g ON c.group_id = g.id
LEFT JOIN tasks t ON c.id = t.challenge_id
GROUP BY c.id, c.title, c.type, c.duration, c.duration_type, g.name;

-- ================================================
-- CLEANUP (if needed)
-- ================================================

-- To remove all seed data and start fresh:
/*
DELETE FROM post_likes;
DELETE FROM notifications;
DELETE FROM posts;
DELETE FROM task_completions;
DELETE FROM challenge_participants;
DELETE FROM teams;
DELETE FROM tasks;
DELETE FROM challenges;
DELETE FROM groups;
-- Do NOT delete from profiles or auth.users
*/

-- ================================================
-- END OF SEED DATA
-- ================================================

-- Instructions:
-- 1. Run schema.sql first
-- 2. Create test users via the app signup flow
-- 3. Get their user IDs from auth.users table
-- 4. Replace 'user-id-1', 'user-id-2', etc. with actual IDs
-- 5. Uncomment the INSERT statements with user IDs
-- 6. Run this file
