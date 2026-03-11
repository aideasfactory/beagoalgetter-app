# Database Schema Documentation - Goal Getter

This document provides a comprehensive overview of the Supabase database structure for the Goal Getter app.

**Database:** PostgreSQL via Supabase
**Schema file:** `supabase/schema.sql`
**Migrations:** `supabase/migrations/`

---

## Quick Reference

**Core Models:**
- `profiles` → Extends `auth.users`, stores user data and stats
- `groups` → Community groups that can host challenges
- `challenges` → Personal or group challenges with tasks
- `tasks` → Individual tasks within challenges
- `challenge_participants` → Users joined to challenges
- `task_completions` → Records of completed tasks
- `posts` → Social feed posts (success/fail updates)
- `notifications` → User notifications
- `post_likes` → Like tracking for posts
- `post_ability_points` → Ability points tracking for posts
- `teams` → Teams within groups

**Key Relationships:**
```
auth.users (1) ── (1) profiles (stats, badges, streaks)

profiles ── (Many) challenges (created_by)
         ── (Many) challenge_participants (joined challenges)
         ── (Many) posts (authored)
         ── (Many) notifications (received)

groups (1) ── (Many) challenges (group challenges)
           ── (Many) teams

challenges (1) ── (Many) tasks
              ── (Many) challenge_participants
              ── (Many) posts
              ── (Many) task_completions

challenge_participants ── (0..1) teams (team assignment)
```

---

## Custom Types (Enums)

| Enum | Values |
|------|--------|
| `challenge_type` | `'personal'`, `'group'` |
| `duration_type` | `'days'`, `'weeks'` |
| `completion_status` | `'success'`, `'fail'`, `'joined'` |
| `notification_type` | `'like'`, `'points'`, `'challenge'`, `'streak'`, `'achievement'`, `'team_update'` |

---

## Tables

### 1. profiles

Extends `auth.users` from Supabase authentication. Auto-created on user signup via trigger.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK, FK to auth.users(id) ON DELETE CASCADE | - | User ID from auth |
| `display_name` | TEXT | nullable | null | User's display name |
| `avatar_url` | TEXT | nullable | null | Profile picture URL |
| `bio` | TEXT | nullable | null | User bio/description |
| `username` | TEXT | UNIQUE, nullable | null | Unique username |
| `longest_streak` | INTEGER | - | 0 | Best streak achieved |
| `current_streak` | INTEGER | - | 0 | Current active streak |
| `total_ability_points` | INTEGER | - | 0 | Total AP earned |
| `challenges_completed` | INTEGER | - | 0 | Completed challenges count |
| `active_challenges` | INTEGER | - | 0 | Currently active challenges |
| `total_challenges` | INTEGER | - | 0 | Total challenges joined |
| `date_of_birth` | DATE | nullable | null | User date of birth |
| `notification_preferences` | JSONB | - | `'{}'` | Notification settings (see structure below) |
| `badges` | JSONB | NOT NULL | `{first_challenge: false, streak_7_days: false, streak_30_days: false, team_player: false, streak_100_days: false, perfect_month: false}` | Badge flags |
| `push_token` | TEXT | nullable | null | Push notification token |
| `device` | TEXT | CHECK IN ('ios', 'android') | null | Device platform |
| `is_premium` | BOOLEAN | - | false | Premium subscription status |
| `is_active` | BOOLEAN | - | true | Account active status |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | - | NOW() | Last update (auto-trigger) |

**Indexes:** `idx_profiles_username` on `username`
**Triggers:** `update_profiles_updated_at` (auto-updates `updated_at`), `on_auth_user_created` (auto-creates profile)

**RLS Policies:**
- Profiles are viewable by everyone (SELECT)
- Users can update own profile (UPDATE)
- Users can insert own profile (INSERT)

**`notification_preferences` JSONB Structure:**
```json
{
  "push_enabled": true,         // Master toggle for all push notifications
  "achievement_alerts": true,   // Achievement-type notifications
  "team_updates": true          // Team update-type notifications
}
```
All keys default to `true` when missing (empty `{}` = all notifications enabled).

---

### 2. groups

Community groups that can host group challenges.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Group ID |
| `name` | TEXT | NOT NULL | - | Group name |
| `description` | TEXT | nullable | null | Group description |
| `logo` | TEXT | nullable | null | Group logo |
| `color` | TEXT | nullable | null | Group brand color |
| `location` | TEXT | nullable | null | Group location |
| `founded` | TEXT | nullable | null | Founding year/date |
| `member_count` | INTEGER | - | 0 | Cached member count |
| `cover_image_url` | TEXT | nullable | null | Cover photo URL |
| `website` | TEXT | nullable | null | Group website |
| `social_links` | JSONB | - | `'{}'` | Social media links |
| `is_verified` | BOOLEAN | - | false | Verified badge |
| `created_by` | UUID | FK to auth.users(id) ON DELETE SET NULL | null | Creator user ID |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | - | NOW() | Last update (auto-trigger) |

**Indexes:** `idx_groups_created_by` on `created_by`
**Triggers:** `update_groups_updated_at`

**RLS Policies:**
- Groups are viewable by everyone (SELECT)
- Authenticated users can create groups (INSERT)
- Group creators can update their groups (UPDATE)
- Group creators can delete their groups (DELETE)

---

### 3. challenges

Main challenges - personal or group-based.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Challenge ID |
| `title` | TEXT | NOT NULL | - | Challenge title |
| `description` | TEXT | nullable | null | Challenge description |
| `type` | challenge_type | NOT NULL | - | personal/group |
| `duration` | INTEGER | NOT NULL | - | Duration value |
| `duration_type` | duration_type | NOT NULL | - | days/weeks |
| `start_date` | DATE | nullable | null | Challenge start date |
| `end_date` | DATE | nullable | null | Challenge end date |
| `status` | TEXT | CHECK IN ('draft', 'active', 'completed', 'cancelled') | 'draft' | Challenge status |
| `is_public` | BOOLEAN | - | true | Public vs private |
| `join_code` | TEXT | nullable | null | Private join code |
| `requires_approval` | BOOLEAN | - | false | Membership approval needed |
| `reminder_frequency` | TEXT | nullable | null | Reminder settings |
| `participant_count` | INTEGER | - | 0 | Cached participant count |
| `group_id` | UUID | FK to groups(id) ON DELETE SET NULL | null | Associated group |
| `image_url` | TEXT | nullable | null | Challenge cover image |
| `created_by` | UUID | FK to auth.users(id) ON DELETE CASCADE | - | Creator user ID |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | - | NOW() | Last update (auto-trigger) |

**Indexes:**
- `idx_challenges_type` on `type`
- `idx_challenges_created_by` on `created_by`
- `idx_challenges_group_id` on `group_id`
- `idx_challenges_created_at` on `created_at DESC`

**Triggers:** `update_challenges_updated_at`

**RLS Policies:**
- Challenges are viewable by everyone (SELECT)
- Authenticated users can create challenges (INSERT)
- Challenge creators can update their challenges (UPDATE)
- Challenge creators can delete their challenges (DELETE)

---

### 4. tasks

Individual tasks within challenges.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Task ID |
| `challenge_id` | UUID | FK to challenges(id) ON DELETE CASCADE, NOT NULL | - | Parent challenge |
| `title` | TEXT | NOT NULL | - | Task title |
| `description` | TEXT | nullable | null | Task description |
| `is_recurring` | BOOLEAN | - | false | Recurring task flag |
| `recurring_days` | TEXT[] | - | `'{}'` | ISO 8601 day numbers (1=Mon, 7=Sun) |
| `order_index` | INTEGER | - | 0 | Sort order |
| `required` | BOOLEAN | - | true | Mandatory vs optional |
| `attachments` | JSONB | - | `'[]'` | Task attachments |
| `items` | JSONB | - | `'[]'` | Sub-items/checklist |
| `is_active` | BOOLEAN | - | true | Can be temporarily disabled |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | - | NOW() | Last update (auto-trigger) |

**Indexes:**
- `idx_tasks_challenge_id` on `challenge_id`
- `idx_tasks_order` on `(challenge_id, order_index)`

**Triggers:** `update_tasks_updated_at`

**RLS Policies:**
- Tasks are viewable by everyone (SELECT)
- Challenge creators can manage tasks (ALL)

---

### 5. teams

Teams within groups (not challenges). Users assigned to teams when joining group challenges.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Team ID |
| `group_id` | UUID | FK to groups(id) ON DELETE CASCADE, NOT NULL | - | Parent group |
| `name` | TEXT | NOT NULL | - | Team name |
| `color` | TEXT | nullable | null | Team color |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |

**Indexes:** `idx_teams_group_id` on `group_id`

**RLS Policies:**
- Teams are viewable by everyone (SELECT)
- Group creators can manage teams (ALL)

---

### 6. challenge_participants

Junction table tracking users joined to challenges.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Participant ID |
| `challenge_id` | UUID | FK to challenges(id) ON DELETE CASCADE, NOT NULL | - | Challenge ID |
| `user_id` | UUID | FK to auth.users(id) ON DELETE CASCADE, NOT NULL | - | User ID |
| `team_id` | UUID | FK to teams(id) ON DELETE SET NULL | null | Team assignment |
| `status` | TEXT | CHECK IN ('active', 'paused', 'quit', 'completed', 'failed') | 'active' | Participation status |
| `joined_at` | TIMESTAMPTZ | - | NOW() | Join timestamp |
| `left_at` | TIMESTAMPTZ | nullable | null | When they left |
| `current_streak` | INTEGER | - | 0 | Current streak in challenge |
| `longest_streak` | INTEGER | - | 0 | Best streak in challenge |
| `total_ability_points` | INTEGER | - | 0 | Points earned in challenge |
| `days_completed` | INTEGER | NOT NULL | 0 | Actual days resolved (success or fail) |
| `notes` | TEXT | nullable | null | Personal notes |
| `quit_reason` | TEXT | nullable | null | Why they quit |

**Constraints:** UNIQUE(`challenge_id`, `user_id`)

**Indexes:**
- `idx_participants_challenge_id` on `challenge_id`
- `idx_participants_user_id` on `user_id`
- `idx_participants_team_id` on `team_id`

**RLS Policies:**
- Participants are viewable by everyone (SELECT)
- Users can join challenges (INSERT where user_id = auth.uid)
- Users can leave challenges (DELETE where user_id = auth.uid)
- Challenge creators can manage participants (ALL)

---

### 7. task_completions

Records of task completions by users.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Completion ID |
| `task_id` | UUID | FK to tasks(id) ON DELETE CASCADE, NOT NULL | - | Task ID |
| `user_id` | UUID | FK to auth.users(id) ON DELETE CASCADE, NOT NULL | - | User ID |
| `challenge_id` | UUID | FK to challenges(id) ON DELETE CASCADE, NOT NULL | - | Challenge ID |
| `completed_at` | TIMESTAMPTZ | - | NOW() | Completion timestamp |
| `notes` | TEXT | nullable | null | User notes |
| `proof_image_url` | TEXT | nullable | null | Photo proof |
| `mood` | TEXT | nullable | null | User mood: very-sad, sad, neutral, happy, very-happy |
| `ability_points_awarded` | INTEGER | - | 0 | Points earned |
| `status` | completion_status | NOT NULL | - | success/fail |

**Indexes:**
- `idx_completions_task_id` on `task_id`
- `idx_completions_user_id` on `user_id`
- `idx_completions_challenge_id` on `challenge_id`
- `idx_completions_completed_at` on `completed_at DESC`

**RLS Policies:**
- Users can view relevant task completions (own + challenge participants)
- Users can create their own task completions (INSERT)
- Users can update their own task completions (UPDATE)
- Users can delete their own task completions (DELETE)

---

### 8. posts

Social feed posts tied to challenges.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Post ID |
| `user_id` | UUID | FK to auth.users(id) ON DELETE CASCADE, NOT NULL | - | Author ID |
| `challenge_id` | UUID | FK to challenges(id) ON DELETE CASCADE, NOT NULL | - | Challenge ID |
| `message` | TEXT | NOT NULL | - | Post message |
| `note` | TEXT | nullable | null | Additional note |
| `image_url` | TEXT | nullable | null | Post image |
| `type` | completion_status | NOT NULL | - | success/fail |
| `is_challenge_complete` | BOOLEAN | NOT NULL | false | True for congratulatory challenge completion posts |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |
| `likes_count` | INTEGER | - | 0 | Total likes (auto-updated via trigger) |
| `ability_points_given` | INTEGER | - | 0 | Total AP given to post |

**Indexes:**
- `idx_posts_user_id` on `user_id`
- `idx_posts_challenge_id` on `challenge_id`
- `idx_posts_created_at` on `created_at DESC`
- `idx_posts_type` on `type`

**Triggers:** `on_post_like_added` (increment), `on_post_like_removed` (decrement)

**RLS Policies:**
- Posts are viewable by everyone (SELECT)
- Users can create posts in their challenges (INSERT - must be participant)
- Users can update their own posts (UPDATE)
- Users can delete their own posts (DELETE)

---

### 9. notifications

User notifications.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Notification ID |
| `user_id` | UUID | FK to auth.users(id) ON DELETE CASCADE, NOT NULL | - | Recipient ID |
| `type` | notification_type | NOT NULL | - | like/points/challenge/streak |
| `message` | TEXT | NOT NULL | - | Notification message |
| `from_user_id` | UUID | FK to auth.users(id) ON DELETE SET NULL | null | Sender ID |
| `post_id` | UUID | FK to posts(id) ON DELETE CASCADE | null | Related post |
| `read` | BOOLEAN | - | false | Read status |
| `created_at` | TIMESTAMPTZ | - | NOW() | Creation timestamp |

**Indexes:**
- `idx_notifications_user_id` on `user_id`
- `idx_notifications_read` on `(user_id, read)`
- `idx_notifications_created_at` on `created_at DESC`

**RLS Policies:**
- Users can only view their own notifications (SELECT)
- Anyone can create notifications (INSERT - for system notifications)
- Users can update their own notifications (UPDATE - mark as read)
- Users can delete their own notifications (DELETE)

---

### 10. post_likes

Tracks who liked which posts.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Like ID |
| `post_id` | UUID | FK to posts(id) ON DELETE CASCADE, NOT NULL | - | Post ID |
| `user_id` | UUID | FK to auth.users(id) ON DELETE CASCADE, NOT NULL | - | User who liked |
| `created_at` | TIMESTAMPTZ | - | NOW() | Like timestamp |

**Constraints:** UNIQUE(`post_id`, `user_id`)

**Indexes:**
- `idx_post_likes_post_id` on `post_id`
- `idx_post_likes_user_id` on `user_id`

**RLS Policies:**
- Likes are viewable by everyone (SELECT)
- Users can like posts (INSERT where user_id = auth.uid)
- Users can unlike posts (DELETE where user_id = auth.uid)

---

### 11. post_ability_points

Tracks which users gave ability points to which posts.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PK | uuid_generate_v4() | Record ID |
| `post_id` | UUID | FK to posts(id) ON DELETE CASCADE, NOT NULL | - | Post receiving points |
| `user_id` | UUID | FK to auth.users(id) ON DELETE CASCADE, NOT NULL | - | User giving points |
| `points` | INTEGER | NOT NULL, CHECK > 0 | - | Number of points given |
| `created_at` | TIMESTAMPTZ | - | NOW() | Timestamp |

**Constraints:** UNIQUE(`post_id`, `user_id`)

**Indexes:**
- `idx_post_ability_points_post_id` on `post_id`
- `idx_post_ability_points_user_id` on `user_id`

**Triggers:**
- `on_ability_points_added` — Recalculates `posts.ability_points_given` as SUM of all points for that post (AFTER INSERT)
- `on_ability_points_updated` — Same recalculation (AFTER UPDATE)
- `on_ability_points_removed` — Same recalculation (AFTER DELETE)

**RLS Policies:**
- Ability points are viewable by everyone (SELECT)
- Users can give ability points (INSERT where user_id = auth.uid AND post author != auth.uid — prevents self-awarding)
- Users can update their own ability points (UPDATE where user_id = auth.uid AND post author != auth.uid — prevents self-awarding via update)
- Users can remove their own ability points (DELETE where user_id = auth.uid)

---

## Database Views

### posts_with_details
Posts joined with user, challenge, and group information. The `ability_points_given` field is computed as `SUM(points)` from `post_ability_points` (not the cached column on `posts`).

**Fields:** `id`, `user_id`, `challenge_id`, `message`, `note`, `image_url`, `type`, `is_challenge_complete`, `created_at`, `likes_count`, `ability_points_given` (computed SUM), `user_name`, `user_avatar`, `user_username`, `user_streak`, `user_ability_points`, `challenge_title`, `challenge_type`, `challenge_participant_count`, `group_id`, `group_name`, `group_logo`, `group_color`

### challenge_leaderboard
Ranked participants per challenge, with profile and team info.

**Fields:** All from `challenge_participants` + `display_name`, `avatar_url`, `username`, `team_name`, `team_color`, `rank` (computed via RANK() window function ordered by `total_ability_points DESC, current_streak DESC`)

### challenge_team_leaderboard
Aggregated team standings per challenge. Sums ability points and streaks from all active/completed team members.

**Fields:** `team_id`, `team_name`, `team_color`, `group_id`, `challenge_id`, `member_count`, `total_points`, `total_streak`, `rank` (computed via RANK() ordered by `total_points DESC`)

### notifications_with_users
Notifications with sender profile details.

**Fields:** All from `notifications` + `from_user_display_name`, `from_user_avatar_url`, `from_user_username`

---

## Functions & Triggers

| Function | Purpose | Trigger |
|----------|---------|---------|
| `update_updated_at_column()` | Auto-updates `updated_at` timestamp | ON UPDATE for profiles, challenges, groups, tasks |
| `handle_new_user()` | Auto-creates profile on signup; generates random `display_name` (e.g. `user_04821`) when none provided | AFTER INSERT on auth.users |
| `increment_post_likes()` | Increments `likes_count` on posts | AFTER INSERT on post_likes |
| `decrement_post_likes()` | Decrements `likes_count` on posts | AFTER DELETE on post_likes |
| `recalculate_post_ability_points()` | Recalculates `ability_points_given` on posts as SUM | AFTER INSERT/UPDATE/DELETE on post_ability_points |
| `recalculate_profile_stats(user_id)` | Aggregates profile stats (streaks, challenges, points) from `challenge_participants` and `post_ability_points` into `profiles` | Called by trigger functions below |
| `trigger_recalculate_profile_stats()` | Calls `recalculate_profile_stats()` for the affected user | AFTER INSERT/UPDATE/DELETE on challenge_participants |
| `trigger_recalculate_profile_stats_from_points()` | Looks up post author, then calls `recalculate_profile_stats()` | AFTER INSERT/UPDATE/DELETE on post_ability_points |
| `update_challenge_participant_count()` | Recalculates `participant_count` on challenges as COUNT from challenge_participants | AFTER INSERT/DELETE on challenge_participants |
| `get_opted_in_users(target_type)` | Returns users (user_id, push_token, device) who have opted in for a notification type and have a push token. Defaults to opted-in when preferences are empty. | Callable function (SECURITY DEFINER) |

---

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public read, owner upload | User profile pictures |
| `challenge-images` | Public read, auth upload | Challenge cover images + Group logos (under `groups/` prefix) |
| `post-images` | Public read, auth upload | Post/completion images |
| `task-documents` | Public read, auth upload | Task attachments (PDFs, documents) uploaded during challenge creation |

---

## Migrations Log

| # | File | Description | Date |
|---|------|-------------|------|
| 001 | `001_add_profile_streak_and_badges.sql` | Added `current_streak` and `badges` JSONB to profiles | - |
| 002 | `002_add_mood_and_convert_recurring_days.sql` | Added `mood` TEXT to task_completions; converted `recurring_days` from day names to ISO 8601 numbers | 2026-02-16 |
| 003 | `003_update_posts_view_add_participant_count.sql` | Updated `posts_with_details` view to add `challenge_participant_count` and `group_id` columns | 2026-02-16 |
| 004 | `004_add_post_ability_points.sql` | Added `post_ability_points` table with triggers to auto-sum into `posts.ability_points_given` | 2026-02-16 |
| 005 | `005_update_posts_view_ability_points_sum.sql` | Updated `posts_with_details` view to compute `ability_points_given` as SUM from `post_ability_points` instead of using cached column | 2026-02-16 |
| 006 | `006_update_handle_new_user_random_username.sql` | Updated `handle_new_user()` to generate random `display_name` (e.g. `user_04821`) when none provided at signup | 2026-02-16 |
| 007 | `007_recalculate_profile_stats.sql` | Added `recalculate_profile_stats()` function + triggers on `challenge_participants` and `post_ability_points` to keep profile stats in sync | 2026-02-18 |
| 008 | `008_add_days_completed_to_participants.sql` | Added `days_completed` column to `challenge_participants` with backfill from `task_completions` | 2026-02-19 |
| 009 | `009_add_is_challenge_complete_to_posts.sql` | Added `is_challenge_complete` boolean to `posts` + updated `posts_with_details` view | 2026-02-19 |
| 010 | `010_auto_update_participant_count.sql` | Added `update_challenge_participant_count()` function + triggers on `challenge_participants` INSERT/DELETE to keep `challenges.participant_count` in sync | 2026-02-20 |
| 011 | `011_add_joined_to_completion_status.sql` | Added `'joined'` value to `completion_status` enum for "X joined the challenge" feed posts | 2026-02-20 |
| 012 | `012_create_task_documents_bucket.sql` | Created `task-documents` storage bucket with RLS policies for task document attachments | 2026-02-20 |
| 013 | `013_update_leaderboard_views.sql` | Updated `challenge_leaderboard` view to include `team_name` and `team_color`; created `challenge_team_leaderboard` view for aggregated team standings | 2026-02-22 |
| 014 | `014_notification_preferences.sql` | Extended `notification_type` enum with `achievement` and `team_update`; created `get_opted_in_users()` function for preference-based notification filtering | 2026-03-08 |
| 015 | `015_prevent_self_ability_points.sql` | Updated RLS INSERT and UPDATE policies on `post_ability_points` to prevent users from awarding ability points to their own posts | 2026-03-11 |

---

## Entity Relationship Diagram

```
auth.users (1) ──── (1) profiles
                         │
                         ├── creates ──── (Many) groups
                         │                   │
                         │                   ├── (Many) teams
                         │                   │
                         │                   └── (Many) challenges
                         │                        │
                         ├── creates ──── (Many) challenges
                         │                   │
                         │                   ├── (Many) tasks
                         │                   │
                         │                   ├── (Many) challenge_participants
                         │                   │       │
                         │                   │       └── (0..1) teams
                         │                   │
                         │                   ├── (Many) task_completions
                         │                   │
                         │                   └── (Many) posts
                         │                        │
                         │                        └── (Many) post_likes
                         │
                         ├── joins ──── (Many) challenge_participants
                         │
                         ├── authors ── (Many) posts
                         │
                         └── receives ── (Many) notifications
```

---

## Notes for Development

1. **All IDs are UUIDs** - generated via `uuid_generate_v4()`
2. **RLS is enabled on ALL tables** - queries always run as the authenticated user
3. **Cached counts** - `likes_count`, `participant_count`, `member_count` are denormalized for performance
4. **Timestamps** - All use `TIMESTAMP WITH TIME ZONE` (stored as UTC)
5. **Badges** - Stored as JSONB boolean flags on the `profiles` table
6. **Auto-triggers** - `updated_at` is auto-managed, profile is auto-created on signup
7. **Views** - Use `posts_with_details`, `challenge_leaderboard`, `challenge_team_leaderboard`, `notifications_with_users` for complex queries
