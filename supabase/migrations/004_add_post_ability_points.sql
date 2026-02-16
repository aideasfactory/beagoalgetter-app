-- Migration 004: Add post_ability_points table
-- Tracks which users gave ability points to which posts (and how many)
-- Trigger auto-sums total points into posts.ability_points_given

-- Table: post_ability_points
CREATE TABLE IF NOT EXISTS post_ability_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX idx_post_ability_points_post_id ON post_ability_points(post_id);
CREATE INDEX idx_post_ability_points_user_id ON post_ability_points(user_id);

-- RLS
ALTER TABLE post_ability_points ENABLE ROW LEVEL SECURITY;

-- Everyone can view ability points given
CREATE POLICY "Ability points are viewable by everyone"
    ON post_ability_points FOR SELECT
    USING (true);

-- Users can give ability points (insert own records)
CREATE POLICY "Users can give ability points"
    ON post_ability_points FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own ability points (change amount)
CREATE POLICY "Users can update their own ability points"
    ON post_ability_points FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can remove their ability points
CREATE POLICY "Users can remove their own ability points"
    ON post_ability_points FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger: recalculate ability_points_given on posts after insert
CREATE OR REPLACE FUNCTION recalculate_post_ability_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET ability_points_given = (
        SELECT COALESCE(SUM(points), 0)
        FROM post_ability_points
        WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ability_points_added
    AFTER INSERT ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_post_ability_points();

CREATE TRIGGER on_ability_points_updated
    AFTER UPDATE ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_post_ability_points();

CREATE TRIGGER on_ability_points_removed
    AFTER DELETE ON post_ability_points
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_post_ability_points();
