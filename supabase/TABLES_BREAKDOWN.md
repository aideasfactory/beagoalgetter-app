# Goal Getter - Database Tables Breakdown

Complete breakdown of all tables ready to create in Supabase.

---

## 📊 ENUMS (Custom Types)

### 1. **challenge_type**
- Values: `'personal'`, `'team'`, `'group'`

### 2. **duration_type**
- Values: `'days'`, `'weeks'`

### 3. **completion_status**
- Values: `'success'`, `'fail'`

### 4. **notification_type**
- Values: `'like'`, `'points'`, `'challenge'`, `'streak'`

---

## 📋 TABLES

### 1. **profiles** (User Profiles)
Extends `auth.users` from Supabase authentication.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, FK to auth.users(id) | - | User ID from auth |
| `display_name` | TEXT | nullable | null | User's display name |
| `avatar_url` | TEXT | nullable | null | Profile picture URL |
| `bio` | TEXT | nullable | null | User bio/description |
| `username` | TEXT | UNIQUE, nullable | null | Unique username |
| `total_streaks` | INTEGER | - | 0 | Total streak count |
| `total_ability_points` | INTEGER | - | 0 | Total AP earned |
| `challenges_completed` | INTEGER | - | 0 | Completed challenges count |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Last update timestamp |

**Indexes:**
- `idx_profiles_username` on `username`

**Triggers:**
- Auto-creates profile on user signup
- Auto-updates `updated_at` on changes

**Missing Fields to Consider:**
- `email_verified` (BOOLEAN)
- `phone_number` (TEXT)
- `date_of_birth` (DATE)
- `gender` (TEXT or ENUM)
- `country` (TEXT)
- `timezone` (TEXT)
- `language_preference` (TEXT)
- `notification_preferences` (JSONB)
- `is_premium` (BOOLEAN)
- `premium_expires_at` (TIMESTAMP)
- `last_login_at` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `is_banned` (BOOLEAN)

---

### 2. **groups** (Community Groups)

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Group ID |
| `name` | TEXT | NOT NULL | - | Group name |
| `description` | TEXT | nullable | null | Group description |
| `logo_emoji` | TEXT | nullable | null | Group emoji icon |
| `color` | TEXT | nullable | null | Group brand color |
| `location` | TEXT | nullable | null | Group location |
| `founded` | TEXT | nullable | null | Founding year/date |
| `created_by` | UUID | FK to auth.users(id) | null | Creator user ID |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |

**Indexes:**
- `idx_groups_created_by` on `created_by`

**Missing Fields to Consider:**
- `is_public` (BOOLEAN) - Public vs private groups
- `member_count` (INTEGER) - Cached member count
- `cover_image_url` (TEXT) - Cover photo
- `website` (TEXT) - Group website
- `social_links` (JSONB) - Social media links
- `category` (TEXT) - Group category (fitness, study, etc.)
- `tags` (TEXT[]) - Searchable tags
- `is_verified` (BOOLEAN) - Verified badge
- `max_members` (INTEGER) - Member limit
- `join_code` (TEXT) - Private join code
- `requires_approval` (BOOLEAN) - Membership approval needed
- `rules` (TEXT) - Group rules
- `updated_at` (TIMESTAMP)

---

### 3. **challenges**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Challenge ID |
| `title` | TEXT | NOT NULL | - | Challenge title |
| `description` | TEXT | nullable | null | Challenge description |
| `type` | challenge_type | NOT NULL | - | personal/team/group |
| `duration` | INTEGER | NOT NULL | - | Duration value |
| `duration_type` | duration_type | NOT NULL | - | days/weeks |
| `group_id` | UUID | FK to groups(id), nullable | null | Associated group |
| `image_url` | TEXT | nullable | null | Challenge cover image |
| `created_by` | UUID | FK to auth.users(id) | - | Creator user ID |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Last update timestamp |

**Indexes:**
- `idx_challenges_type` on `type`
- `idx_challenges_created_by` on `created_by`
- `idx_challenges_group_id` on `group_id`
- `idx_challenges_created_at` on `created_at DESC`

**Triggers:**
- Auto-updates `updated_at` on changes

**Missing Fields to Consider:**
- `start_date` (DATE) - Challenge start date
- `end_date` (DATE) - Challenge end date
- `status` (ENUM: 'draft', 'active', 'completed', 'cancelled')
- `is_public` (BOOLEAN) - Public vs private
- `difficulty_level` (TEXT or ENUM: 'easy', 'medium', 'hard')
- `category` (TEXT) - Challenge category
- `tags` (TEXT[]) - Searchable tags
- `max_participants` (INTEGER) - Participant limit
- `entry_fee` (DECIMAL) - Entry cost
- `prize` (TEXT) - Prize description
- `visibility` (ENUM: 'public', 'private', 'friends-only')
- `join_code` (TEXT) - Private join code
- `requires_approval` (BOOLEAN)
- `reminder_frequency` (TEXT) - Reminder settings
- `participant_count` (INTEGER) - Cached count

---

### 4. **tasks**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Task ID |
| `challenge_id` | UUID | FK to challenges(id), NOT NULL | - | Parent challenge |
| `title` | TEXT | NOT NULL | - | Task title |
| `description` | TEXT | nullable | null | Task description |
| `is_recurring` | BOOLEAN | - | false | Recurring task flag |
| `recurring_days` | TEXT[] | - | '{}' | Days of week |
| `order_index` | INTEGER | - | 0 | Sort order |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |

**Indexes:**
- `idx_tasks_challenge_id` on `challenge_id`
- `idx_tasks_order` on `(challenge_id, order_index)`

**Missing Fields to Consider:**
- `task_type` (ENUM: 'checkbox', 'number', 'time', 'photo', 'text')
- `target_value` (DECIMAL) - For numeric goals (e.g., 10,000 steps)
- `unit` (TEXT) - Unit of measurement (steps, km, reps)
- `required` (BOOLEAN) - Mandatory vs optional
- `points_value` (INTEGER) - Default points for completion
- `estimated_duration` (INTEGER) - Minutes to complete
- `reminder_time` (TIME) - Daily reminder time
- `attachments` (JSONB) - Task attachments/resources
- `updated_at` (TIMESTAMP)
- `is_active` (BOOLEAN) - Can be temporarily disabled

---

### 5. **teams**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Team ID |
| `challenge_id` | UUID | FK to challenges(id), NOT NULL | - | Parent challenge |
| `name` | TEXT | NOT NULL | - | Team name |
| `color` | TEXT | nullable | null | Team color |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |

**Indexes:**
- `idx_teams_challenge_id` on `challenge_id`

**Missing Fields to Consider:**
- `captain_id` (UUID) - Team captain/leader
- `motto` (TEXT) - Team motto/tagline
- `logo_url` (TEXT) - Team logo
- `member_count` (INTEGER) - Cached count
- `total_points` (INTEGER) - Team total points
- `rank` (INTEGER) - Current rank in challenge
- `max_members` (INTEGER) - Team size limit
- `is_recruiting` (BOOLEAN) - Open to new members
- `updated_at` (TIMESTAMP)

---

### 6. **challenge_participants**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Participant ID |
| `challenge_id` | UUID | FK to challenges(id), NOT NULL | - | Challenge ID |
| `user_id` | UUID | FK to auth.users(id), NOT NULL | - | User ID |
| `team_id` | UUID | FK to teams(id), nullable | null | Team assignment |
| `joined_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Join timestamp |
| `current_streak` | INTEGER | - | 0 | Current streak count |
| `total_ability_points` | INTEGER | - | 0 | Points in challenge |

**Constraints:**
- UNIQUE(`challenge_id`, `user_id`) - Can't join same challenge twice

**Indexes:**
- `idx_participants_challenge_id` on `challenge_id`
- `idx_participants_user_id` on `user_id`
- `idx_participants_team_id` on `team_id`

**Missing Fields to Consider:**
- `status` (ENUM: 'active', 'paused', 'quit', 'completed', 'failed')
- `completion_percentage` (DECIMAL) - % of tasks done
- `longest_streak` (INTEGER) - Best streak
- `last_activity_at` (TIMESTAMP) - Last task completion
- `notes` (TEXT) - Personal notes about challenge
- `is_private` (BOOLEAN) - Hide from leaderboards
- `invitation_sent_by` (UUID) - Who invited them
- `left_at` (TIMESTAMP) - When they left (if applicable)
- `quit_reason` (TEXT) - Why they quit

---

### 7. **task_completions**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Completion ID |
| `task_id` | UUID | FK to tasks(id), NOT NULL | - | Task ID |
| `user_id` | UUID | FK to auth.users(id), NOT NULL | - | User ID |
| `challenge_id` | UUID | FK to challenges(id), NOT NULL | - | Challenge ID |
| `completed_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Completion timestamp |
| `notes` | TEXT | nullable | null | User notes |
| `ability_points_awarded` | INTEGER | - | 0 | Points earned |
| `status` | completion_status | NOT NULL | - | success/fail |

**Indexes:**
- `idx_completions_task_id` on `task_id`
- `idx_completions_user_id` on `user_id`
- `idx_completions_challenge_id` on `challenge_id`
- `idx_completions_completed_at` on `completed_at DESC`

**Missing Fields to Consider:**
- `actual_value` (DECIMAL) - Actual achievement (e.g., 12,543 steps)
- `proof_image_url` (TEXT) - Photo proof
- `location` (GEOGRAPHY or TEXT) - Where completed
- `duration_minutes` (INTEGER) - Time taken
- `is_verified` (BOOLEAN) - Admin/peer verified
- `verified_by` (UUID) - Who verified
- `mood` (TEXT or ENUM) - How they felt
- `difficulty_rating` (INTEGER) - 1-5 how hard it was
- `updated_at` (TIMESTAMP) - If they edit completion

---

### 8. **posts** (Social Feed)

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Post ID |
| `user_id` | UUID | FK to auth.users(id), NOT NULL | - | Author ID |
| `challenge_id` | UUID | FK to challenges(id), NOT NULL | - | Challenge ID |
| `message` | TEXT | NOT NULL | - | Post message |
| `note` | TEXT | nullable | null | Additional note |
| `image_url` | TEXT | nullable | null | Post image |
| `type` | completion_status | NOT NULL | - | success/fail |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |
| `likes_count` | INTEGER | - | 0 | Total likes (cached) |
| `ability_points_given` | INTEGER | - | 0 | Total AP given |

**Indexes:**
- `idx_posts_user_id` on `user_id`
- `idx_posts_challenge_id` on `challenge_id`
- `idx_posts_created_at` on `created_at DESC`
- `idx_posts_type` on `type`

**Triggers:**
- Auto-increments/decrements `likes_count`

**Missing Fields to Consider:**
- `comment_count` (INTEGER) - Cached comment count
- `is_pinned` (BOOLEAN) - Pinned to top
- `is_featured` (BOOLEAN) - Featured post
- `visibility` (ENUM: 'public', 'friends', 'team', 'challenge')
- `edited_at` (TIMESTAMP) - Last edit time
- `is_deleted` (BOOLEAN) - Soft delete
- `deleted_at` (TIMESTAMP)
- `tags` (TEXT[]) - Hashtags
- `mentions` (UUID[]) - Tagged users
- `share_count` (INTEGER) - Times shared
- `video_url` (TEXT) - Video attachment
- `location` (TEXT) - Location tagged

---

### 9. **notifications**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Notification ID |
| `user_id` | UUID | FK to auth.users(id), NOT NULL | - | Recipient ID |
| `type` | notification_type | NOT NULL | - | like/points/challenge/streak |
| `message` | TEXT | NOT NULL | - | Notification message |
| `from_user_id` | UUID | FK to auth.users(id), nullable | null | Sender ID |
| `post_id` | UUID | FK to posts(id), nullable | null | Related post |
| `read` | BOOLEAN | - | false | Read status |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Creation timestamp |

**Indexes:**
- `idx_notifications_user_id` on `user_id`
- `idx_notifications_read` on `(user_id, read)`
- `idx_notifications_created_at` on `created_at DESC`

**Missing Fields to Consider:**
- `challenge_id` (UUID) - Related challenge
- `action_url` (TEXT) - Deep link to action
- `read_at` (TIMESTAMP) - When marked read
- `is_push_sent` (BOOLEAN) - Push notification sent
- `is_email_sent` (BOOLEAN) - Email notification sent
- `priority` (ENUM: 'low', 'normal', 'high', 'urgent')
- `expires_at` (TIMESTAMP) - Auto-delete old notifications
- `action_required` (BOOLEAN) - Needs user action
- `metadata` (JSONB) - Extra data

---

### 10. **post_likes**

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Like ID |
| `post_id` | UUID | FK to posts(id), NOT NULL | - | Post ID |
| `user_id` | UUID | FK to auth.users(id), NOT NULL | - | User who liked |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | NOW() | Like timestamp |

**Constraints:**
- UNIQUE(`post_id`, `user_id`) - Can't like same post twice

**Indexes:**
- `idx_post_likes_post_id` on `post_id`
- `idx_post_likes_user_id` on `user_id`

**Missing Fields to Consider:**
- `reaction_type` (ENUM: 'like', 'love', 'fire', 'celebrate') - Different reactions
- Nothing else really needed for this simple table

---

## 🎨 VIEWS (Pre-computed Queries)

### 1. **posts_with_details**
Joins posts with user, challenge, and group information.

**Fields:**
- All fields from `posts`
- `user_name`, `user_avatar`, `user_username`
- `challenge_title`, `challenge_type`
- `group_name`, `group_logo`, `group_color`

### 2. **challenge_leaderboard**
Ranked participants per challenge.

**Fields:**
- All fields from `challenge_participants`
- `display_name`, `avatar_url`, `username`
- `rank` (computed)

---

## 💾 STORAGE BUCKETS

### 1. **avatars**
- User profile pictures
- Public read access
- Users can upload their own

### 2. **challenge-images**
- Challenge cover images
- Public read access
- Authenticated users can upload

### 3. **post-images**
- Post/completion images
- Public read access
- Authenticated users can upload

**Missing Buckets to Consider:**
- `group-images` - Group logos/covers
- `team-logos` - Team logos
- `documents` - PDF checklists, resources
- `videos` - Video posts/proofs
- `exports` - User data exports

---

## 🔧 TRIGGERS & FUNCTIONS

### Existing:
1. **update_updated_at_column()** - Auto-updates `updated_at` timestamp
2. **handle_new_user()** - Auto-creates profile on signup
3. **increment_post_likes()** - Increments like count on like
4. **decrement_post_likes()** - Decrements like count on unlike

### Missing Functions to Consider:
- **update_streak()** - Calculate streaks on task completion
- **award_points()** - Calculate ability points based on difficulty
- **update_participant_stats()** - Update cached stats
- **calculate_team_ranking()** - Update team ranks
- **send_notification()** - Create notification on events
- **check_challenge_completion()** - Mark challenge complete
- **cleanup_old_data()** - Archive old completions/posts

---

## 📊 SUGGESTED NEW TABLES

### 1. **comments** (Post Comments)
```sql
- id (UUID, PK)
- post_id (UUID, FK to posts)
- user_id (UUID, FK to auth.users)
- parent_comment_id (UUID, FK to comments, nullable) -- For replies
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_deleted (BOOLEAN)
```

### 2. **friendships** (Friend Connections)
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- friend_id (UUID, FK to auth.users)
- status (ENUM: 'pending', 'accepted', 'blocked')
- created_at (TIMESTAMP)
- accepted_at (TIMESTAMP)
```

### 3. **invitations** (Challenge Invites)
```sql
- id (UUID, PK)
- challenge_id (UUID, FK to challenges)
- inviter_id (UUID, FK to auth.users)
- invitee_id (UUID, FK to auth.users)
- status (ENUM: 'pending', 'accepted', 'declined', 'expired')
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
```

### 4. **achievements** (User Badges)
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- achievement_type (TEXT)
- earned_at (TIMESTAMP)
- metadata (JSONB)
```

### 5. **challenge_messages** (Team Chat)
```sql
- id (UUID, PK)
- challenge_id (UUID, FK to challenges)
- user_id (UUID, FK to auth.users)
- message (TEXT)
- created_at (TIMESTAMP)
- is_deleted (BOOLEAN)
```

### 6. **reports** (Content Moderation)
```sql
- id (UUID, PK)
- reporter_id (UUID, FK to auth.users)
- reported_user_id (UUID, FK to auth.users, nullable)
- reported_post_id (UUID, FK to posts, nullable)
- reason (TEXT)
- status (ENUM: 'pending', 'reviewed', 'actioned')
- created_at (TIMESTAMP)
```

### 7. **follows** (User Follows)
```sql
- id (UUID, PK)
- follower_id (UUID, FK to auth.users)
- following_id (UUID, FK to auth.users)
- created_at (TIMESTAMP)
```

### 8. **rewards** (Points/Prizes)
```sql
- id (UUID, PK)
- challenge_id (UUID, FK to challenges)
- rank (INTEGER)
- reward_type (TEXT)
- reward_value (TEXT)
- description (TEXT)
```

### 9. **analytics_events** (User Activity Tracking)
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- event_type (TEXT)
- event_data (JSONB)
- created_at (TIMESTAMP)
```

### 10. **subscriptions** (Premium/Pro)
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- plan_type (TEXT)
- status (ENUM: 'active', 'cancelled', 'expired')
- started_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- stripe_subscription_id (TEXT)
```

---

## 🎯 Priority for Adding Fields/Tables

### High Priority:
1. Add `status` field to challenges (draft/active/completed)
2. Add `start_date` and `end_date` to challenges
3. Create **comments** table for post interactions
4. Add `is_public` fields for privacy control
5. Create **challenge_messages** table for team chat

### Medium Priority:
1. Create **friendships** table
2. Create **invitations** table
3. Add more profile fields (timezone, preferences)
4. Create **achievements** table
5. Add **reports** table for moderation

### Low Priority:
1. Create **follows** table
2. Create **rewards** table
3. Add analytics tables
4. Add subscription management
5. Add more notification types

---

**Ready to expand!** Use this breakdown to identify what fields and tables you want to add to your database schema.
