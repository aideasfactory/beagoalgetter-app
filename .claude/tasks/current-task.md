# Task: Fix social feed streak display so it shows the streak for that specific challenge

**Created:** 2026-03-14
**Last Updated:** 2026-03-14
**Status:** Complete

---

## Overview

### Goal
Fix the streak value shown on the social feed so it displays the challenge-specific streak instead of the user's overall profile streak.

### Context
- Tile ID: 019ce35e-14d1-7068-8fd6-66fc9e470553
- Repository: beagoalgetter-app
- Branch: feature/019ce35e-14d1-7068-8fd6-66fc9e470553-fix-social-feed-streak-display-so-it-shows-the-streak-for-th
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Bug Analysis

**Root Cause:** The `posts_with_details` SQL view joins `profiles` and uses `pr.current_streak AS user_streak` — this is the user's **overall** current streak from the `profiles` table, not the streak for the specific challenge tied to the post.

**Correct Source:** The `challenge_participants` table has a `current_streak` column that tracks the streak per user per challenge. Each post already has both `user_id` and `challenge_id`, so we can join `challenge_participants` to get the challenge-specific streak.

### Plan
1. Create migration to fix the view — join `challenge_participants` and use `cp.current_streak`
2. No frontend changes needed — field name stays `user_streak`
3. Update database-schema.md

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Create migration `020_fix_posts_view_challenge_streak.sql`
- [x] Update `.claude/database-schema.md` view documentation and migrations log
- [x] Self-review checklist

### Self-Review
- [x] All phase tasks checked off
- [x] Code follows project patterns (matches existing view recreation pattern from migrations 016/018)
- [x] TypeScript types unaffected (field name unchanged)
- [x] Supabase queries use proper error handling (N/A — view definition only)
- [x] current-task.md updated with progress

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Reflection
The fix was straightforward — a single SQL view change. The `posts_with_details` view was pulling `current_streak` from the `profiles` table (user's overall streak across all challenges) when it should have been pulling from `challenge_participants` (the streak for the specific challenge associated with each post). The fix adds a `LEFT JOIN` to `challenge_participants` on `(user_id, challenge_id)` and uses `COALESCE(cp.current_streak, 0)` to handle edge cases where a participant record might not exist.

No frontend changes were needed since the field name (`user_streak`) is preserved.

### Files Changed
- `supabase/migrations/020_fix_posts_view_challenge_streak.sql` (new)
- `.claude/database-schema.md` (updated view docs + migrations log)
- `.claude/tasks/current-task.md` (task tracking)

### Technical Debt
- None introduced

---

## TASK COMPLETE
**Summary:** Fixed social feed streak display by updating the `posts_with_details` database view to source the streak from `challenge_participants.current_streak` (challenge-specific) instead of `profiles.current_streak` (user-wide overall streak).
