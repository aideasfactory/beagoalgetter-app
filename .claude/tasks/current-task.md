# Task: Review and confirm nightly failed-post cron job configuration

**Created:** 2026-03-12
**Last Updated:** 2026-03-12
**Status:** ✅ Complete

---

## Overview

### Goal
Build and configure the nightly failed-post automation that creates a "fail" post when a user misses their day in an active challenge.

### Context
- Tile ID: 019cd910-1fa9-71db-9776-408674af5df8
- Repository: beagoalgetter-app
- Branch: feature/019cd910-1fa9-71db-9776-408674af5df8-review-and-confirm-nightly-failed-post-cron-job-configuratio
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Findings
- The nightly failed-post automation **did not exist**. No cron job, Edge Function, or trigger handled this.
- Migration 008 comment references "cron job at midnight (fail)" but no implementation existed.
- The `posts` table already supports `type = 'fail'` via the `completion_status` enum.
- `challenge_participants.days_completed` tracks resolved days (success or fail).
- `useCompleteDay.ts` handles the success path only.

### Implementation Plan
Single SQL migration using pg_cron to schedule a nightly function.

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Create migration `017_nightly_failed_posts_cron.sql`
- [x] Create `process_nightly_failed_posts()` SQL function
- [x] Schedule with pg_cron at 5:00 AM UTC daily
- [x] Update `.claude/database-schema.md` with new function, migration log entry, and cron verification instructions

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Reflection
The nightly failed-post automation was entirely missing from the codebase despite being referenced in migration 008's comments. The implementation uses a pure SQL approach with pg_cron, which is the most reliable option for Supabase — no Edge Functions or external schedulers needed.

The `process_nightly_failed_posts()` function correctly mirrors the success-path logic in `useCompleteDay.ts`:
- Creates a fail post (matching the success post creation pattern)
- Increments `days_completed` (matching the success increment)
- Resets `current_streak` to 0 (streak-breaking on miss)
- Handles challenge completion when all days are resolved

Key design decisions:
- **5:00 AM UTC schedule** — gives buffer for US timezones (midnight EST, 9 PM PST previous day)
- **SECURITY DEFINER** — function runs with elevated privileges to insert posts on behalf of users
- **Idempotent** — skips users who already have a post for yesterday, safe to re-run
- **Task-aware** — only creates fail posts when required tasks were actually available on that day

### Technical Debt
- Timezone handling is UTC-based. If the app needs per-user timezone support in the future, the function would need to be updated to check each user's local midnight.
- No push notification is sent for failed posts. Could be added later by calling `get_opted_in_users()` within the function.

---

## TASK COMPLETE

**Files Changed:**
- `supabase/migrations/017_nightly_failed_posts_cron.sql` (new)
- `.claude/database-schema.md` (updated)
- `.claude/tasks/current-task.md` (updated)
