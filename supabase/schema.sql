-- ================================================
-- Goal Getter - Supabase Database Schema
-- ================================================
-- This script creates all required tables, enums, indexes,
-- RLS policies, and triggers for the Goal Getter app
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

-- Challenge types
CREATE TYPE challenge_type AS ENUM ('personal', 'group');

-- Duration types
CREATE TYPE duration_type AS ENUM ('days', 'weeks');

-- Task completion status
CREATE TYPE completion_status AS ENUM ('success', 'fail');

-- Notification types
CREATE TYPE notification_type AS ENUM ('like', 'points', 'challenge', 'streak');

-- ================================================
-- PROFILES TABLE (extends auth.users)
-- ================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    username TEXT UNIQUE,
    longest_streak INTEGER DEFAULT 0,
    total_ability_points INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    active_challenges INTEGER DEFAULT 0,
    total_challenges INTEGER DEFAULT 0,
    date_of_birth DATE,
    notification_preferences JSONB DEFAULT '{}',
    push_token TEXT,
    device TEXT CHECK (device IN ('ios', 'android')),
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- ================================================
-- GROUPS TABLE
-- ================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    color TEXT,
    location TEXT,
    founded TEXT,
    member_count INTEGER DEFAULT 0,
    cover_image_url TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for created_by
CREATE INDEX idx_groups_created_by ON groups(created_by);

-- ================================================
-- CHALLENGES TABLE
-- ================================================

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type challenge_type NOT NULL,
    duration INTEGER NOT NULL,
    duration_type duration_type NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    is_public BOOLEAN DEFAULT true,
    join_code TEXT,
    requires_approval BOOLEAN DEFAULT false,
    reminder_frequency TEXT,
    participant_count INTEGER DEFAULT 0,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for challenges
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_created_by ON challenges(created_by);
CREATE INDEX idx_challenges_group_id ON challenges(group_id);
CREATE INDEX idx_challenges_created_at ON challenges(created_at DESC);

-- ================================================
-- TASKS TABLE
-- ================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_days TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    required BOOLEAN DEFAULT true,
    attachments JSONB DEFAULT '[]',
    items JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for challenge_id
CREATE INDEX idx_tasks_challenge_id ON tasks(challenge_id);
CREATE INDEX idx_tasks_order ON tasks(challenge_id, order_index);

-- ================================================
-- TEAMS TABLE
-- ================================================
-- Teams belong to groups, not challenges
-- Users can be assigned to teams when joining group challenges

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for group_id
CREATE INDEX idx_teams_group_id ON teams(group_id);

-- ================================================
-- CHALLENGE_PARTICIPANTS TABLE
-- ================================================

CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'quit', 'completed', 'failed')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_ability_points INTEGER DEFAULT 0,
    notes TEXT,
    quit_reason TEXT,
    UNIQUE(challenge_id, user_id)
);

-- Indexes for challenge_participants
CREATE INDEX idx_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_participants_user_id ON challenge_participants(user_id);
CREATE INDEX idx_participants_team_id ON challenge_participants(team_id);

-- ================================================
-- TASK_COMPLETIONS TABLE
-- ================================================

CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    proof_image_url TEXT,
    ability_points_awarded INTEGER DEFAULT 0,
    status completion_status NOT NULL
);

-- Indexes for task_completions
CREATE INDEX idx_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_completions_user_id ON task_completions(user_id);
CREATE INDEX idx_completions_challenge_id ON task_completions(challenge_id);
CREATE INDEX idx_completions_completed_at ON task_completions(completed_at DESC);

-- ================================================
-- POSTS TABLE
-- ================================================

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    note TEXT,
    image_url TEXT,
    type completion_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes_count INTEGER DEFAULT 0,
    ability_points_given INTEGER DEFAULT 0
);

-- Indexes for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_challenge_id ON posts(challenge_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_type ON posts(type);

-- ================================================
-- NOTIFICATIONS TABLE
-- ================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ================================================
-- POST_LIKES TABLE (for tracking who liked what)
-- ================================================

CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Indexes for post_likes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for challenges updated_at
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for groups updated_at
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, username)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'username'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to increment post likes count
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post likes count
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for post likes
CREATE TRIGGER on_post_like_added
    AFTER INSERT ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION increment_post_likes();

CREATE TRIGGER on_post_like_removed
    AFTER DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_post_likes();

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PROFILES POLICIES
-- ================================================

-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ================================================
-- GROUPS POLICIES
-- ================================================

-- Anyone can view groups
CREATE POLICY "Groups are viewable by everyone"
    ON groups FOR SELECT
    USING (true);

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Group creators can update their groups
CREATE POLICY "Group creators can update their groups"
    ON groups FOR UPDATE
    USING (auth.uid() = created_by);

-- Group creators can delete their groups
CREATE POLICY "Group creators can delete their groups"
    ON groups FOR DELETE
    USING (auth.uid() = created_by);

-- ================================================
-- CHALLENGES POLICIES
-- ================================================

-- Anyone can view challenges
CREATE POLICY "Challenges are viewable by everyone"
    ON challenges FOR SELECT
    USING (true);

-- Authenticated users can create challenges
CREATE POLICY "Authenticated users can create challenges"
    ON challenges FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Challenge creators can update their challenges
CREATE POLICY "Challenge creators can update their challenges"
    ON challenges FOR UPDATE
    USING (auth.uid() = created_by);

-- Challenge creators can delete their challenges
CREATE POLICY "Challenge creators can delete their challenges"
    ON challenges FOR DELETE
    USING (auth.uid() = created_by);

-- ================================================
-- TASKS POLICIES
-- ================================================

-- Anyone can view tasks
CREATE POLICY "Tasks are viewable by everyone"
    ON tasks FOR SELECT
    USING (true);

-- Challenge creators can manage tasks
CREATE POLICY "Challenge creators can manage tasks"
    ON tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE challenges.id = tasks.challenge_id
            AND challenges.created_by = auth.uid()
        )
    );

-- ================================================
-- TEAMS POLICIES
-- ================================================

-- Anyone can view teams
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

-- Group creators can manage teams
CREATE POLICY "Group creators can manage teams"
    ON teams FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = teams.group_id
            AND groups.created_by = auth.uid()
        )
    );

-- ================================================
-- CHALLENGE_PARTICIPANTS POLICIES
-- ================================================

-- Anyone can view participants
CREATE POLICY "Participants are viewable by everyone"
    ON challenge_participants FOR SELECT
    USING (true);

-- Users can join challenges
CREATE POLICY "Users can join challenges"
    ON challenge_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can leave challenges
CREATE POLICY "Users can leave challenges"
    ON challenge_participants FOR DELETE
    USING (auth.uid() = user_id);

-- Challenge creators can manage participants
CREATE POLICY "Challenge creators can manage participants"
    ON challenge_participants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE challenges.id = challenge_participants.challenge_id
            AND challenges.created_by = auth.uid()
        )
    );

-- ================================================
-- TASK_COMPLETIONS POLICIES
-- ================================================

-- Users can view their own completions and completions in their challenges
CREATE POLICY "Users can view relevant task completions"
    ON task_completions FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_participants.challenge_id = task_completions.challenge_id
            AND challenge_participants.user_id = auth.uid()
        )
    );

-- Users can create their own completions
CREATE POLICY "Users can create their own task completions"
    ON task_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own completions
CREATE POLICY "Users can update their own task completions"
    ON task_completions FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own completions
CREATE POLICY "Users can delete their own task completions"
    ON task_completions FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- POSTS POLICIES
-- ================================================

-- Anyone can view posts
CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT
    USING (true);

-- Users can create posts in challenges they're part of
CREATE POLICY "Users can create posts in their challenges"
    ON posts FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_participants.challenge_id = posts.challenge_id
            AND challenge_participants.user_id = auth.uid()
        )
    );

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
    ON posts FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- NOTIFICATIONS POLICIES
-- ================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Anyone can create notifications (for system notifications)
CREATE POLICY "Anyone can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- POST_LIKES POLICIES
-- ================================================

-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone"
    ON post_likes FOR SELECT
    USING (true);

-- Users can like posts
CREATE POLICY "Users can like posts"
    ON post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
CREATE POLICY "Users can unlike posts"
    ON post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- HELPER VIEWS
-- ================================================

-- View for posts with user and challenge details
CREATE OR REPLACE VIEW posts_with_details AS
SELECT 
    p.*,
    pr.display_name as user_name,
    pr.avatar_url as user_avatar,
    pr.username as user_username,
    pr.longest_streak as user_streak,
    pr.total_ability_points as user_ability_points,
    c.title as challenge_title,
    c.type as challenge_type,
    g.name as group_name,
    g.logo as group_logo,
    g.color as group_color
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN challenges c ON p.challenge_id = c.id
LEFT JOIN groups g ON c.group_id = g.id;

-- View for challenge leaderboard
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT 
    cp.*,
    pr.display_name,
    pr.avatar_url,
    pr.username,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.total_ability_points DESC, cp.current_streak DESC) as rank
FROM challenge_participants cp
LEFT JOIN profiles pr ON cp.user_id = pr.id;

-- View for notifications with from-user profile details
CREATE OR REPLACE VIEW notifications_with_users AS
SELECT
    n.*,
    pr_from.display_name AS from_user_display_name,
    pr_from.avatar_url   AS from_user_avatar_url,
    pr_from.username     AS from_user_username
FROM notifications n
LEFT JOIN profiles pr_from ON n.from_user_id = pr_from.id;

-- ================================================
-- STORAGE BUCKETS
-- ================================================

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('challenge-images', 'challenge-images', true),
    ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for challenge images
CREATE POLICY "Challenge images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'challenge-images');

CREATE POLICY "Authenticated users can upload challenge images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'challenge-images' AND
        auth.uid() IS NOT NULL
    );

-- Storage policies for post images
CREATE POLICY "Post images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'post-images' AND
        auth.uid() IS NOT NULL
    );

-- ================================================
-- INITIAL DATA (Optional)
-- ================================================

-- You can add sample data here if needed for testing

-- ================================================
-- END OF SCHEMA
-- ================================================

-- To run this schema:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
-- 
-- Note: Make sure to run this on a fresh database or 
-- modify it to handle existing tables if needed.
