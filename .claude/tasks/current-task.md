# Task: Investigate and fix comment reloading after the app is reopened

**Created:** 2026-03-13
**Last Updated:** 2026-03-13T18:05:00Z
**Status:** ✅ TASK COMPLETE

---

## Overview

### Goal
Fix comment loading so previously created comments load correctly when the user opens the comment section after restarting the app.

### Context
- Tile ID: 019ce83c-a35b-721e-bc6f-e724c840023f
- Repository: beagoalgetter-app
- Branch: feature/019ce83c-a35b-721e-bc6f-e724c840023f-investigate-and-fix-comment-reloading-after-the-app-is-reope
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Root Cause
`postService.getPostComments()` used a PostgREST embedded join `profiles:user_id(...)` but `post_comments.user_id` references `auth.users(id)`, not `profiles(id)`. PostgREST couldn't resolve the relationship, causing the query to fail silently. The error was caught and `comments` was set to `[]`, showing "No comments yet" after restart.

Comments appeared to work when freshly added because `createComment()` already used a separate profile fetch (avoiding the join) and added results to local state via optimistic update.

### Fix
Replace the broken embedded join with a two-step query: fetch comments first, then batch-fetch profiles by unique user IDs.

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Update `getPostComments()` in `services/post.ts` to use two-step query
- [x] Self-review checklist passed

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Reflection
- **What worked:** The root cause was identifiable from a comment in `createComment` that explicitly noted "PostgREST relationship resolution issues with profiles:user_id". The fix was straightforward — apply the same pattern to `getPostComments`.
- **Files changed:** `services/post.ts` (single file, single method)
- **Technical debt:** None introduced. The fix actually reduces inconsistency — both `getPostComments` and `createComment` now use the same two-step approach.
- **Future note:** If a `post_comments_with_user` view is ever created in the database, both methods could be simplified to a single query.
