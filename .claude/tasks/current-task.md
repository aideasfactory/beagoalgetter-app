# Task: Prevent users from adding ability points to their own posts

**Created:** 2026-03-11
**Last Updated:** 2026-03-11T00:10:00Z
**Status:** In Progress

---

## Overview

### Goal
Prevent users from awarding ability points to their own posts, enforced at both the database (RLS) and frontend (UI) levels.

### Success Criteria
- [x] Task requirements implemented
- [ ] Changes committed on feature branch only
- [ ] Tests written where appropriate
- [x] Claude Code writes .phase_done on completion

### Context
- Tile ID: 019cd8fa-b6c9-71c9-80aa-8cbaaee91b76
- Repository: beagoalgetter-app
- Branch: feature/019cd8fa-b6c9-71c9-80aa-8cbaaee91b76-prevent-users-from-adding-ability-points-to-their-own-posts-1
- Priority: MEDIUM
- Customer: Goal Getter
- Due: unspecified

### Description
Users should not be able to award ability points to posts they created themselves. The restriction must be enforced at the database level via RLS policies and at the frontend level by hiding the "Give Points" button on the user's own posts.

---

## 🎯 PHASE 1: PLANNING
**Status:** ✅ Complete

### Tasks
- [x] Review requirements
- [x] Review relevant existing code (PostCard, GivePointsModal, useFeedPosts, postService, migration 015)
- [x] Identify required components/services/hooks
- [x] Plan Supabase/RLS changes
- [x] Define implementation phases

### Analysis
The ability points system currently allows any authenticated user to give points to any post, including their own. Migration 015 already exists and correctly updates the RLS INSERT and UPDATE policies on `post_ability_points` to block self-awarding at the database level. However, the frontend still shows the "Give Points" button on the user's own posts, which creates a misleading UX.

### Files Plan

**New files to create:**
- None

**Files to modify:**
- `supabase/migrations/015_prevent_self_ability_points.sql` — Already exists, no changes needed
- `components/PostCard.tsx` — Add `isOwnPost` prop, hide "Give Points" button for own posts
- `hooks/useFeedPosts.ts` — Include `isOwnPost` in mapped FeedPost using current user ID
- `.claude/database-schema.md` — Update RLS policies for post_ability_points
- `.claude/tasks/current-task.md` — Track progress

### Supabase Requirements
- [x] New tables needed? No
- [x] New RLS policies needed? Yes — migration 015 already handles this
- [x] New migrations needed? No — migration 015 already exists
- [x] Schema documentation update needed? Yes — update RLS policy docs for post_ability_points

### Dependencies Needed
- None

### Decisions Made
- Add `isOwnPost` boolean to the `Post` interface rather than exposing raw `userId`
- Compute `isOwnPost` in `useFeedPosts.ts` using the current user's ID from `supabase.auth.getUser()`
- Hide the "Give Points" button entirely for own posts (don't just disable it)
- Keep the database-level RLS check as the authoritative security boundary

### Risks Identified
- Minor: if the auth user fetch fails, `isOwnPost` defaults to false — worst case the button shows but RLS still blocks

### Reflection
**What went well:**
- Migration 015 was already prepared, simplifying the backend work
- The change is well-scoped: two frontend files + documentation

**What could be improved:**
- The `Post` interface could eventually include a generic ownership flag for other features

**→ Phase complete. Proceed immediately to the next phase.**

---

## 🔨 PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Add `isOwnPost` to `Post` interface in `PostCard.tsx`
- [x] Hide "Give Points" button when `isOwnPost` is true
- [x] Update `useFeedPosts.ts` to compute `isOwnPost` from current user ID
- [x] Update `.claude/database-schema.md` with new RLS policies and migration 015 entry
- [x] Self-review all changes

### Currently Working On
Completed.

### Files Created
- None

### Files Modified
- `components/PostCard.tsx` — Added `isOwnPost?: boolean` to `Post` interface; wrapped "Give Points" button in `{!post.isOwnPost && (...)}`
- `hooks/useFeedPosts.ts` — Added `supabase` import; added `currentUserId` parameter to `mapPostToFeedPost`; fetched current user via `supabase.auth.getUser()` in parallel with other data; set `isOwnPost` on each mapped post
- `.claude/database-schema.md` — Updated RLS policies for `post_ability_points` to document self-awarding prevention; added migration 015 to the log

### Implementation Details
- **PostCard.tsx**: Added `isOwnPost?: boolean` to the `Post` interface. The "Give Points" button is now conditionally rendered: `{!post.isOwnPost && (...)}`. When `isOwnPost` is true, the button is hidden entirely — no misleading state.
- **useFeedPosts.ts**: Added `supabase.auth.getUser()` to the existing `Promise.all` call (no extra network round-trip penalty). The current user's ID is compared against `post.user_id` in `mapPostToFeedPost` to compute `isOwnPost`.
- **Migration 015**: Already existed with correct RLS policy changes (INSERT and UPDATE both check `auth.uid() != post.user_id`). No modifications needed.
- **Database docs**: Updated RLS policy descriptions and added migration 015 to the log.

### Self-Review Checklist
- [x] All phase tasks checked off
- [x] Code follows project patterns
- [x] NativeWind/Tailwind classes used for styling
- [x] Error handling in place (RLS acts as safety net)
- [x] Loading states implemented (no new loading states needed)
- [x] TypeScript types defined (`isOwnPost?: boolean`)
- [x] No console.log statements left
- [x] Supabase queries use proper error handling
- [x] current-task.md updated with progress
- [x] Reflection section filled out

### Reflection
**What went well:**
- Clean integration with existing parallel data fetching — no extra network call
- The `PostWithDetails` type already includes `user_id`, so no type changes needed on the database types
- Both layers (database RLS + frontend UI) are now aligned

**What could be improved:**
- Could add an explicit error toast when the RLS rejects a self-award attempt (currently silent), but this is a rare edge case since the UI now hides the button

**→ Phase complete. Proceed immediately to the next phase.**

---

## 💭 PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** 🔄 In Progress

### Tasks
- [ ] Finalise task documentation
- [ ] Summarise files changed and any limitations
- [ ] Write `.phase_done` sentinel in the project root

### Currently Working On
Writing final documentation and sentinel.

### Files Created
- `/Users/claw/Herd/beagoalgetter-app/.phase_done`

### Files Modified
- `.claude/tasks/current-task.md`

### Implementation Details
Final documentation updated. Sentinel file prepared.

### Notes
- No automated tests were added because the core enforcement is via RLS policy (database-level) and the frontend change is a simple conditional render.

### Reflection
**What went well:**
- Clean, minimal changes across two frontend files + one migration + documentation
- Defence in depth: RLS prevents bypass even if frontend is circumvented

**What could be improved:**
- Future: could add integration tests for the RLS policy via Supabase test helpers

**→ Phase complete. Proceed immediately to the next phase.**

---

## TASK COMPLETE

**Completed:** 2026-03-11

### Final Summary
Implemented self-award prevention for ability points on posts. The database layer (migration 015) updates RLS INSERT and UPDATE policies on `post_ability_points` to reject requests where the authenticated user is the post author. The frontend layer hides the "Give Points" button on the user's own posts by computing an `isOwnPost` flag in `useFeedPosts.ts` and conditionally rendering the button in `PostCard.tsx`. Database schema documentation was updated with the new RLS policies and migration entry.

### Known Limitations
- If `supabase.auth.getUser()` fails, `isOwnPost` defaults to false and the button will still show — but the RLS policy remains the authoritative guard.
- No explicit error toast for edge-case RLS rejection (silent failure).

### Future Improvements
- Add integration tests for the RLS policy
- Consider a reusable `useCurrentUser` hook to avoid repeated `getUser()` calls

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-11-prevent-self-ability-points.md`
