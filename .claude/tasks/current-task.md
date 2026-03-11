# Task: Fix Incorrect Points Total on Challenge Sign-Off Screen

**Created:** 2026-03-11
**Last Updated:** 2026-03-11
**Status:** Complete

---

## Overview

### Goal
Fix the points stat (green trophy icon) on the challenge detail screen so it accurately reflects the user's awarded ability points for that challenge.

### Root Cause
`challenge_participants.total_ability_points` was **never updated**. The existing `recalculate_profile_stats()` function (migration 007) only updates `profiles.total_ability_points` (the global total across all challenges), but nothing updates the per-challenge `challenge_participants.total_ability_points` column. This means the stat always showed 0.

### Success Criteria
- [x] Root cause identified
- [x] Points stat on challenge screen shows correct total
- [x] Manually awarded points (e.g., 15 points) appear correctly
- [x] `challenge_participants.total_ability_points` kept in sync via DB trigger
- [x] Leaderboard views also reflect correct points
- [x] Stat accurate across challenge states and refreshes
- [x] Database schema docs updated

---

## PHASE 1: PLANNING — ✅ Complete

### Analysis
- `app/challenge/[id].tsx` line 120 displays `challenge.totalPoints`
- `hooks/useChallengeDetail.ts` line 127 maps `p.total_ability_points` → `totalPoints`
- `challenge_participants.total_ability_points` is never updated by any trigger or code
- `recalculate_profile_stats()` (migration 007) only updates `profiles.total_ability_points`

### Decisions
- Follow the same trigger pattern as migration 007
- Frontend calculates from `posts.ability_points_given` as primary source of truth
- DB trigger keeps `challenge_participants.total_ability_points` in sync for leaderboard views

---

## PHASE 2: IMPLEMENTATION — ✅ Complete

### Tasks
- [x] Create migration `015_sync_participant_ability_points.sql`
- [x] Update `hooks/useChallengeDetail.ts` to calculate points correctly

### Files Created
- `supabase/migrations/015_sync_participant_ability_points.sql` — Trigger + backfill to keep `challenge_participants.total_ability_points` in sync

### Files Modified
- `hooks/useChallengeDetail.ts` — Now queries `posts.ability_points_given` and sums client-side for accurate points display

### Reflection
The fix has two layers: (1) the frontend hook now calculates points directly from `posts.ability_points_given` which is already maintained by existing triggers, so the display is correct immediately; (2) the new migration adds triggers to keep `challenge_participants.total_ability_points` in sync, which fixes leaderboard views and backfills existing data.

---

## PHASE 3: REFLECTION & CLEANUP — ✅ Complete

### Tasks
- [x] Update `.claude/database-schema.md` with new migration and functions
- [x] Final review
- [x] Write sentinel file

### Final Review
- Frontend hook calculates points from `posts.ability_points_given` (already kept in sync by `recalculate_post_ability_points()` triggers from migration 004)
- DB migration follows same pattern as migration 007 with SECURITY DEFINER functions
- Backfill in migration handles all existing data
- No console.log statements
- TypeScript types maintained
- Error handling preserved

---

## TASK COMPLETE

**Completed:** 2026-03-11

### Final Summary
Fixed incorrect points total on the challenge sign-off screen. Root cause: `challenge_participants.total_ability_points` was never updated — the existing `recalculate_profile_stats()` only updated the global `profiles.total_ability_points`. Fix: (1) Updated `useChallengeDetail.ts` to calculate points by summing `posts.ability_points_given` for the user's posts in the challenge, giving immediate correct display. (2) Created migration 015 with triggers on `post_ability_points` to keep `challenge_participants.total_ability_points` in sync, fixing leaderboard views and backfilling existing data.

### Known Limitations
1. Migration 015 must be run on the Supabase instance to activate the DB triggers and backfill

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-11-fix-points-total.md`
