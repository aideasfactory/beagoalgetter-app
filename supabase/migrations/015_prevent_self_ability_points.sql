-- Migration 015: Prevent users from giving ability points to their own posts
-- Updates RLS policies on post_ability_points to block self-awarding

-- Drop existing INSERT policy (allows self-awarding)
DROP POLICY IF EXISTS "Users can give ability points" ON post_ability_points;

-- New INSERT policy: user must be authenticated AND cannot award points to own posts
CREATE POLICY "Users can give ability points"
    ON post_ability_points FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() != (SELECT p.user_id FROM posts p WHERE p.id = post_id)
    );

-- Drop existing UPDATE policy (allows updating to self-award via update)
DROP POLICY IF EXISTS "Users can update their own ability points" ON post_ability_points;

-- New UPDATE policy: same self-awarding check on update
CREATE POLICY "Users can update their own ability points"
    ON post_ability_points FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() != (SELECT p.user_id FROM posts p WHERE p.id = post_id)
    );
