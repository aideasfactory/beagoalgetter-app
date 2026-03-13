# Task: Review and implement nightly failed-challenge post creation rules

**Created:** 2026-03-13
**Last Updated:** 2026-03-13T15:15:00Z
**Status:** ✅ Complete

---

## Overview

### Goal
Review and fix the nightly failed-challenge post automation (`process_nightly_failed_posts()`) so failed posts are created reliably based on correct daily conditions.

### Context
- Tile ID: 019ce74b-12d3-70f5-94e3-4093a5863969
- Repository: beagoalgetter-app
- Branch: feature/019ce74b-12d3-70f5-94e3-4093a5863969-review-and-implement-nightly-failed-challenge-post-creation-
- Priority: MEDIUM
- Existing migration: `017_nightly_failed_posts_cron.sql`

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Analysis of Existing Logic (Migration 017)

The `process_nightly_failed_posts()` function runs at 5:00 AM UTC daily via pg_cron. It:
1. Finds active participants in active challenges where yesterday was a valid challenge day
2. Checks if required tasks were available yesterday (recurring by day-of-week, non-recurring if not yet completed)
3. Skips users who already have a post for that challenge on yesterday
4. Creates a fail post, increments `days_completed`, resets `current_streak`
5. Handles challenge completion if all days are now resolved

### Bugs Identified

#### Bug 1: Fail post `created_at` is `NOW()` instead of yesterday
- The INSERT used default `created_at` = `NOW()`, which is ~5 AM UTC today
- The duplicate check looks for posts with `created_at::DATE = yesterday`
- **Impact:** If cron runs twice in one day, duplicates are NOT caught
- **Impact:** Feed shows fail post on the wrong day (today instead of yesterday)
- **Fix:** Set `created_at` to yesterday at 23:59 UTC

#### Bug 2: Off-by-one with explicit `end_date`
- The boundary check used `COALESCE(c.end_date, computed_end) > yesterday`
- Computed end is exclusive (start + N days) → works with `>`
- Explicit `end_date` is inclusive (last valid day) → `>` skips the last day
- **Fix:** Handle explicit vs computed end_date separately

### Verified Correct Behavior
- Task availability logic (recurring by day-of-week, non-recurring if never completed) matches frontend `useTodaysTasks.ts`
- `days_completed` increment + challenge completion logic matches `useCompleteDay.ts`
- Streak reset to 0 on failure is correct
- Personal challenge auto-completion is correct

### Reflection
The original migration had the right overall structure and logic flow. The two bugs were subtle edge cases — the timestamp issue only matters for idempotency and feed ordering, and the end_date issue only affects challenges with explicitly set end dates on their final day.

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Write migration `019_fix_nightly_failed_posts.sql`
- [x] Self-review checklist

### Changes Made
- Created `supabase/migrations/019_fix_nightly_failed_posts.sql`:
  - Added `yesterday_ts` variable set to yesterday at 23:59 UTC
  - Changed fail post INSERT to explicitly set `created_at = yesterday_ts`
  - Split end_date boundary into two conditions: explicit `end_date >= yesterday` (inclusive) and computed end `> yesterday` (exclusive)
  - No cron schedule change needed (already registered from migration 017)

### Reflection
The fix is minimal and targeted — only the two identified bugs are addressed. The function signature, cron schedule, and overall logic flow remain unchanged. Using `CREATE OR REPLACE FUNCTION` means this migration cleanly updates the existing function.

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Update `database-schema.md` with migration 019
- [x] Update `process_nightly_failed_posts()` description in Functions table
- [x] Update current-task.md with reflection
- [x] Write `.phase_done` sentinel

### Files Changed
- `supabase/migrations/019_fix_nightly_failed_posts.sql` (new)
- `.claude/database-schema.md` (updated function description + migrations log)
- `.claude/tasks/current-task.md` (updated)

---

## TASK COMPLETE

### Summary
Reviewed the existing `process_nightly_failed_posts()` cron function and identified two bugs: (1) fail posts were timestamped with `NOW()` instead of yesterday, breaking feed ordering and idempotency protection, and (2) an off-by-one error with explicitly set `end_date` values that skipped the last day of a challenge. Created migration 019 to fix both issues with minimal, targeted changes.

### Technical Debt
- None introduced

### Future Improvements
- Consider timezone-aware processing (users in UTC+12 might still be working when cron runs at 5 AM UTC)
- Could add logging/metrics to track how many fail posts are created per run
