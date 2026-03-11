# Task: Add challenge day indicators to posts on the main social feed

**Created:** 2026-03-11
**Last Updated:** 2026-03-11T21:50:00Z
**Status:** Complete

---

## Overview

### Goal
Add a clear "Day X of Y" indicator to each post on the main social feed, showing which day of the challenge the post belongs to.

### Context
- Tile ID: 019cdbc5-84f7-728b-b199-93ecfb6167b4
- Repository: beagoalgetter-app
- Branch: feature/019cdbc5-84f7-728b-b199-93ecfb6167b4-add-challenge-day-indicators-to-posts-on-the-main-social-fee
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Analysis
- Posts displayed via PostCard → useFeedPosts → posts_with_details view
- View lacked challenge start_date, duration, duration_type
- Solution: add 3 columns to view, compute day client-side, render in PostCard header

### Reflection
Clean approach — no new tables/columns, just exposing existing challenge data through the view.

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Create migration 016 to update posts_with_details view
- [x] Update PostWithDetails type in database.example.ts
- [x] Add challengeDay to Post interface in PostCard.tsx
- [x] Update mapPostToFeedPost to compute and map challenge day
- [x] Render "Day X of Y" indicator in PostCard
- [x] Update database-schema.md

### Self-Review Checklist
- [x] All phase tasks checked off
- [x] Code follows project patterns (NativeWind classes, existing component structure)
- [x] NativeWind/Tailwind classes used for styling
- [x] Error handling in place (null start_date gracefully handled)
- [x] TypeScript types defined (challengeDay interface, PostWithDetails updates)
- [x] No console.log statements left
- [x] Supabase queries use proper error handling (view change only)
- [x] current-task.md updated with progress

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### What was built
Added "Day X of Y" challenge progress indicators to every post on the main social feed. The indicator appears as a subtle pill badge next to the challenge name in the post header.

### Approach
1. **Database layer**: Updated `posts_with_details` view (migration 016) to expose `challenge_start_date`, `challenge_duration`, `challenge_duration_type` from the existing challenges table join.
2. **Type layer**: Extended `PostWithDetails` with three new fields; added `challengeDay` optional object to `Post` interface.
3. **Logic layer**: Added `computeChallengeDay()` in useFeedPosts.ts that calculates the day number from the challenge start date and post creation date. Clamps to valid range (1 to totalDays).
4. **UI layer**: Rendered a `bg-white/10` rounded pill showing "Day X of Y" next to the challenge name, only when start_date is available.

### Edge cases handled
- Null start_date → indicator not shown
- Post before start date → clamped to Day 1
- Post after challenge end → clamped to max day
- Weeks-based challenges → correctly converted to total days

### Technical debt
- None introduced. Clean additive change.

### Files changed
- `supabase/migrations/016_add_challenge_dates_to_posts_view.sql` (new)
- `types/database.example.ts`
- `components/PostCard.tsx`
- `hooks/useFeedPosts.ts`
- `.claude/database-schema.md`

---

## TASK COMPLETE
All 3 phases executed successfully.
