# Goal Getter - Supabase Database Setup

This directory contains all the SQL scripts needed to set up the Goal Getter database in Supabase.

## Quick Start

### Option 1: Run Complete Schema (Recommended for Fresh Setup)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `schema.sql`
5. Click **Run**

This will create:
- ✅ All 9 required tables
- ✅ All necessary indexes
- ✅ Row Level Security (RLS) policies
- ✅ Database functions and triggers
- ✅ Storage buckets for images
- ✅ Helper views for common queries

### Option 2: Run Individual Migration Files

If you prefer to run migrations step-by-step (or if you need to modify the schema), you can run the files in the `migrations/` directory in order:

```
migrations/
├── 001_create_enums.sql
├── 002_create_profiles.sql
├── 003_create_groups.sql
├── 004_create_challenges.sql
├── 005_create_tasks.sql
├── 006_create_teams.sql
├── 007_create_participants.sql
├── 008_create_completions.sql
├── 009_create_posts.sql
├── 010_create_notifications.sql
├── 011_create_functions.sql
├── 012_create_rls_policies.sql
└── 013_create_storage.sql
```

## Database Schema Overview

### Core Tables

#### 1. **profiles** (extends auth.users)
- User profile information
- Display name, avatar, bio, username
- Stats: longest_streak, total_ability_points, challenges_completed, active_challenges, total_challenges
- Settings: date_of_birth, notification_preferences, push_token, device
- Flags: is_premium, is_active

#### 2. **groups**
- Community groups for group challenges
- Created by users
- Has name, description, logo, color, location, founded
- Metadata: member_count, cover_image_url, website, social_links, is_verified

#### 3. **challenges**
- Main challenges table
- Types: personal, group (team type removed - teams now belong to groups)
- Duration in days or weeks, with start_date and end_date
- Status: draft, active, completed, cancelled
- Settings: is_public, join_code, requires_approval, reminder_frequency
- Cached participant_count, links to group if type is 'group'

#### 4. **tasks**
- Tasks within challenges
- Can be recurring (with specific days)
- Ordered by order_index
- Fields: required, attachments (JSONB), items (JSONB), is_active

#### 5. **teams**
- Teams belong to groups (not challenges)
- A group can have many teams
- Users can be assigned to teams when joining group challenges
- Has name and color

#### 6. **challenge_participants**
- Junction table for users in challenges
- Tracks current_streak, longest_streak, and ability points per challenge
- Status: active, paused, quit, completed, failed
- Fields: joined_at, left_at, notes, quit_reason
- Links to team if user is part of a team in a group challenge

#### 7. **task_completions**
- Records of task completions
- Status: success or fail
- Tracks ability points awarded
- Includes optional notes and proof_image_url

#### 8. **posts**
- Social feed posts
- Created when users complete/fail tasks
- Tracks likes and ability points given
- Can include images and notes

#### 9. **notifications**
- User notifications
- Types: like, points, challenge, streak
- Read/unread status

#### 10. **post_likes** (bonus table)
- Tracks who liked which post
- Unique constraint per user/post

## Key Features

### 🔒 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public Read**: Most content is publicly viewable (profiles, groups, challenges, posts)
- **Owner Write**: Users can only modify their own content
- **Participant Access**: Users can only interact with challenges they've joined
- **Private Notifications**: Users can only see their own notifications

### 🔄 Automatic Triggers

- **Auto-create profile**: When a user signs up, their profile is automatically created
- **Update timestamps**: `updated_at` fields are automatically updated
- **Like counters**: Post likes are automatically counted

### 📊 Helper Views

- **posts_with_details**: Posts with user, challenge, and group information joined
- **challenge_leaderboard**: Ranked participants per challenge

### 📁 Storage Buckets

Three storage buckets are created:
- **avatars**: User profile pictures
- **challenge-images**: Challenge cover images
- **post-images**: Images attached to posts

All buckets are public for reading, with authenticated upload policies.

## Database Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
    ├── groups (1:many) - created_by
    ├── challenges (1:many) - created_by
    │       ├── tasks (1:many)
    │       ├── teams (1:many)
    │       └── challenge_participants (1:many)
    │               └── task_completions (1:many)
    ├── posts (1:many)
    │       └── post_likes (1:many)
    └── notifications (1:many)
```

## Enums

The following PostgreSQL enums are defined:

- **challenge_type**: `personal`, `group` (team type removed - teams now belong to groups)
- **duration_type**: `days`, `weeks`
- **completion_status**: `success`, `fail`
- **notification_type**: `like`, `points`, `challenge`, `streak`

## Indexes for Performance

Key indexes are created for:
- User lookups (username, user_id)
- Challenge filtering (type, created_at, created_by)
- Feed queries (posts.created_at DESC)
- Participant lookups (challenge_id, user_id, team_id)
- Notification queries (user_id, read status)

## Modifying the Schema

If you need to modify the schema after initial setup:

1. **Add columns**: Create a new migration file
2. **Modify columns**: Use `ALTER TABLE` statements
3. **Add policies**: Create new policy migration
4. **Test locally**: Use Supabase CLI for local development

Example migration for adding a column:

```sql
-- migrations/014_add_challenge_visibility.sql
ALTER TABLE challenges
ADD COLUMN visibility TEXT DEFAULT 'public'
CHECK (visibility IN ('public', 'private', 'unlisted'));
```

## Testing the Schema

After running the schema, test with these queries:

### 1. Check tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. Check RLS policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Check storage buckets
```sql
SELECT * FROM storage.buckets;
```

### 4. Insert test data
```sql
-- Insert a test group
INSERT INTO groups (name, description, logo_emoji, color, created_by)
VALUES ('Test Fitness Group', 'A test group', '💪', '#00c2ff', auth.uid());

-- Insert a test challenge
INSERT INTO challenges (title, description, type, duration, duration_type, created_by)
VALUES ('30-Day Push-up Challenge', 'Do push-ups every day', 'personal', 30, 'days', auth.uid());
```

## Troubleshooting

### Issue: "permission denied for schema auth"
**Solution**: Make sure you're running the script in the SQL Editor, not as a regular migration.

### Issue: "relation already exists"
**Solution**: The tables already exist. Either:
- Drop existing tables first: `DROP TABLE IF EXISTS table_name CASCADE;`
- Or modify the schema to use `CREATE TABLE IF NOT EXISTS`

### Issue: "could not create unique index"
**Solution**: You have duplicate data. Clean up duplicates before adding unique constraints.

### Issue: RLS policies blocking queries
**Solution**: Check your policies with:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

## Next Steps

After setting up the database:

1. ✅ Test the schema with sample data
2. ✅ Update your React Native app to use these tables
3. ✅ Create TypeScript types for your tables (use Supabase CLI: `supabase gen types typescript`)
4. ✅ Implement CRUD operations in your services
5. ✅ Test RLS policies with different user roles

## Useful Supabase Commands

### Generate TypeScript Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

### Local Development
```bash
# Start local Supabase
npx supabase start

# Run migrations
npx supabase db push

# Reset database
npx supabase db reset
```

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Created for Goal Getter App**  
Version: 1.0  
Last Updated: 2025-11-14
