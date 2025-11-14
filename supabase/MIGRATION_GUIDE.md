# Database Migration Guide

Step-by-step guide for setting up and maintaining the Goal Getter database.

## Initial Setup (First Time)

### Method 1: Quick Setup (Recommended)

1. **Go to Supabase Dashboard**
   - Visit [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to **SQL Editor** in the left sidebar

2. **Run the Schema**
   - Click **New Query**
   - Copy the entire contents of `schema.sql`
   - Paste into the editor
   - Click **RUN** button (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take 5-10 seconds)

3. **Verify Installation**
   ```sql
   -- Check tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   
   -- Should return:
   -- challenge_participants
   -- challenges
   -- groups
   -- notifications
   -- post_likes
   -- posts
   -- profiles
   -- task_completions
   -- tasks
   -- teams
   ```

4. **Load Seed Data (Optional)**
   - Open `seed-data.sql`
   - Follow instructions to create test users first
   - Replace placeholder IDs with real user IDs
   - Run the modified seed data

### Method 2: Using Supabase CLI (For Developers)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Initialize local database (optional, for local dev)
npx supabase start

# Push the schema
npx supabase db push

# Or run migrations
npx supabase db reset
```

## After Schema Installation

### 1. Generate TypeScript Types

Generate TypeScript types for type-safe database queries:

```bash
# Using Supabase CLI
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

# Or using their web generator
# Go to: Settings > API > Generate Types
```

### 2. Test the Database

Run these test queries to make sure everything works:

```sql
-- Test 1: Create a test profile (replace with your auth.uid())
INSERT INTO profiles (id, display_name, username)
VALUES (auth.uid(), 'Test User', 'testuser123')
RETURNING *;

-- Test 2: Create a test challenge
INSERT INTO challenges (title, description, type, duration, duration_type, created_by)
VALUES ('Test Challenge', 'My first challenge', 'personal', 30, 'days', auth.uid())
RETURNING *;

-- Test 3: Query the challenge
SELECT * FROM challenges WHERE created_by = auth.uid();
```

### 3. Configure Storage

The schema automatically creates storage buckets, but verify they exist:

1. Go to **Storage** in Supabase Dashboard
2. You should see three buckets:
   - `avatars`
   - `challenge-images`
   - `post-images`
3. All should have public access for reading

### 4. Test RLS Policies

Test that Row Level Security is working:

```sql
-- This should only return YOUR profile
SELECT * FROM profiles WHERE id = auth.uid();

-- This should return all profiles (public read)
SELECT * FROM profiles;

-- This should fail (can't update other users)
UPDATE profiles SET display_name = 'Hacked!' WHERE id != auth.uid();
```

## Making Changes to the Schema

### Adding a New Column

Create a new migration file:

```sql
-- migrations/014_add_challenge_difficulty.sql
ALTER TABLE challenges
ADD COLUMN difficulty TEXT DEFAULT 'medium'
CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Add index if needed
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);

-- Update RLS policies if needed
-- (No changes needed if new column doesn't affect security)
```

### Adding a New Table

```sql
-- migrations/015_create_comments_table.sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Modifying an Existing Column

```sql
-- migrations/016_modify_challenge_duration.sql

-- Add new column
ALTER TABLE challenges
ADD COLUMN duration_end_date TIMESTAMP WITH TIME ZONE;

-- Populate it based on existing data (optional)
UPDATE challenges
SET duration_end_date = created_at + 
    CASE 
        WHEN duration_type = 'days' THEN (duration || ' days')::INTERVAL
        WHEN duration_type = 'weeks' THEN (duration * 7 || ' days')::INTERVAL
    END;

-- Make it NOT NULL after populating (optional)
-- ALTER TABLE challenges ALTER COLUMN duration_end_date SET NOT NULL;
```

## Common Migration Scenarios

### Scenario 1: Already Have Data, Need to Add Schema

If you already have an app running with data:

1. **Backup first!**
   ```bash
   # Using Supabase CLI
   npx supabase db dump -f backup.sql
   ```

2. **Modify schema.sql**
   - Change `CREATE TABLE` to `CREATE TABLE IF NOT EXISTS`
   - Remove or modify conflicting policies

3. **Run incrementally**
   - Run table creation first
   - Then indexes
   - Then RLS policies
   - Then triggers

### Scenario 2: Schema Conflict

If you get "already exists" errors:

```sql
-- Drop existing objects (CAREFUL!)
DROP TABLE IF EXISTS table_name CASCADE;
DROP TYPE IF EXISTS enum_name CASCADE;
DROP FUNCTION IF EXISTS function_name CASCADE;

-- Then re-run schema.sql
```

### Scenario 3: RLS Blocking Everything

If RLS policies are too restrictive:

```sql
-- Temporarily disable RLS for debugging (NEVER in production!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check what's wrong
SELECT * FROM table_name;

-- Fix policies, then re-enable
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## Maintenance Tasks

### Weekly: Check Database Size

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monthly: Vacuum and Analyze

```sql
-- Reclaim space and update statistics
VACUUM ANALYZE;

-- For specific tables
VACUUM ANALYZE table_name;
```

### As Needed: Reindex

```sql
-- If queries are slow
REINDEX TABLE table_name;

-- Or reindex everything (careful, locks tables)
REINDEX SCHEMA public;
```

## Troubleshooting

### Problem: "permission denied for table"

**Solution:**
```sql
-- Grant permissions
GRANT ALL ON TABLE table_name TO authenticated;
GRANT SELECT ON TABLE table_name TO anon;
```

### Problem: "could not serialize access"

**Solution:** This is a transaction conflict. Add retry logic in your app or use:
```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- your queries
COMMIT;
```

### Problem: "no rows returned by a query that should return rows"

**Solution:** Check RLS policies:
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test without RLS (as admin)
SET ROLE postgres;
SELECT * FROM your_table;
RESET ROLE;
```

### Problem: Foreign key constraint violation

**Solution:** Check references before deleting:
```sql
-- See what references a record
SELECT 
    tc.table_name, 
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='your_table';
```

## Rollback Procedures

### Roll back the last migration

```bash
# Using Supabase CLI
npx supabase db reset

# Or manually in SQL Editor
DROP TABLE new_table CASCADE;
ALTER TABLE existing_table DROP COLUMN new_column;
```

### Restore from backup

```bash
# If you have a backup
npx supabase db push backup.sql

# Or in SQL Editor
-- Copy paste backup SQL content
```

## Best Practices

1. **Always backup before major changes**
2. **Test migrations on a staging project first**
3. **Use transactions for multi-step migrations**
4. **Document all custom migrations**
5. **Keep schema.sql as source of truth**
6. **Use meaningful migration names with timestamps**
7. **Never disable RLS in production**
8. **Monitor query performance after changes**

## Resources

- [Supabase SQL Docs](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

For questions or issues, check the main README.md or Supabase documentation.
