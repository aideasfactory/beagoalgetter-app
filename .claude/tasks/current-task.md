# Task: Auto-create notification when someone comments on your post

**Created:** 2026-03-14
**Last Updated:** 2026-03-14
**Status:** Complete

---

## Overview

### Goal
Create a database trigger on `post_comments` that automatically inserts a notification for the post author when someone comments on their post.

### Context
- Currently no notifications are auto-generated anywhere in the app
- This is the first notification-creating trigger

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Analysis
- `post_comments` has `post_id`, `user_id`, `content`
- `posts` has `user_id` (post author to notify)
- `notifications` has `user_id` (recipient), `from_user_id`, `post_id`, `type`, `message`
- Need to add `comment` to `notification_type` enum
- Trigger fires AFTER INSERT on `post_comments`, skips self-comments

---

## PHASE 2: DATABASE MIGRATION
**Status:** ✅ Complete

- [x] Created `supabase/migrations/020_comment_notification_trigger.sql`
  - Adds `comment` to `notification_type` enum
  - `notify_post_author_on_comment()` function (SECURITY DEFINER)
  - Looks up post author, skips if commenter == author
  - Looks up commenter display_name for notification message
  - Inserts into `notifications` with type `comment`
  - Trigger `on_post_comment_notify_author` AFTER INSERT on `post_comments`

---

## PHASE 3: UPDATE DOCS & TYPES
**Status:** ✅ Complete

- [x] Updated `database-schema.md` — enum, triggers table, post_comments triggers, migration log
- [x] Updated `types/database.example.ts` — added `comment` to NotificationType
- [x] Updated `components/NotificationsModal.tsx` — added `comment` to local type + chatbubble icon

---

## PHASE 4: REFLECTION & CLEANUP
**Status:** ✅ Complete

### Reflection
- Clean, minimal implementation: one migration file, three small edits
- Used SECURITY DEFINER so the trigger can always insert notifications regardless of RLS context
- Self-comment filtering prevents noise
- This sets the pattern for future notification triggers (likes, points, etc.)

### Files Changed
- `supabase/migrations/020_comment_notification_trigger.sql` (new)
- `types/database.example.ts` — added `comment` to NotificationType
- `.claude/database-schema.md` — updated enum, triggers, migration log
- `components/NotificationsModal.tsx` — added `comment` type + icon

### TASK COMPLETE
All requirements met. A database trigger now auto-creates a notification for the post author whenever someone else comments on their post.
