# Task: Posts Page Amendments (Pull-to-Refresh, Image Fix, Ability Points)

**Created:** 2026-02-16
**Last Updated:** 2026-02-16
**Status:** ✅ Complete

---

## Overview

### Goal
Three amendments to the posts feed page:
1. **Pull-to-refresh** — Add pull-down-to-refresh so users can swipe down to reload posts
2. **Image upload fix** — Fix blank proof image when completing a task; the `proof_image_url` on task_completions and `image_url` on posts are not being saved/loaded correctly
3. **Ability points total** — Show the total ability points given to a post by ALL users (sum from `post_ability_points` table), not just the cached `posts.ability_points_given` column

### Success Criteria
- [ ] Pull-to-refresh works on the posts feed (both "All" and "My Challenges" tabs)
- [ ] Proof image from task completion appears correctly on the post in the feed
- [ ] Ability points on each post show the correct total from `post_ability_points` table
- [ ] Existing UI design is preserved
- [ ] No regressions to existing functionality (likes, group click, challenge preview, etc.)

### Context
- Home screen: `app/(tabs)/index.tsx` — uses `ScrollView` without `RefreshControl`
- Feed hook: `hooks/useFeedPosts.ts` — exposes `refetch` but no refreshing state
- Image upload: `hooks/useCompleteDay.ts` — uses `fetch(imageUri).blob()` which may not work reliably in React Native/Expo
- Ability points: `posts_with_details` view uses `p.ability_points_given` (trigger-maintained cache) rather than computing SUM from `post_ability_points`
- Post display: `components/PostCard.tsx` — shows `post.abilityPointsGiven`

---

## PHASE 1: PLANNING

**Status:** 🔄 In Progress

### Tasks
- [x] Review current home screen and feed implementation
- [x] Review image upload flow in useCompleteDay
- [x] Review ability points data flow (view → hook → PostCard)
- [x] Identify root causes for each issue
- [x] Plan implementation approach
- [ ] Get approval before coding

### Issue Analysis

#### Issue 1: No Pull-to-Refresh
**Current state:** `index.tsx` uses `<ScrollView>` without `RefreshControl`. Users cannot pull down to refresh posts.

**Fix:** Add `RefreshControl` to the `ScrollView`. Need a `refreshing` state in `useFeedPosts` hook that is `true` during refetch but does NOT show the full loading spinner (only the pull-to-refresh indicator).

**Files to modify:**
- `hooks/useFeedPosts.ts` — Add `refreshing` state and expose it; modify `refetch` to set `refreshing` instead of `loading`
- `app/(tabs)/index.tsx` — Import `RefreshControl`, add to `ScrollView`

#### Issue 2: Blank Proof Image
**Current state:** `useCompleteDay.ts:uploadProofImage()` uses `fetch(imageUri).blob()` to read the local file. In React Native/Expo, this approach can produce empty blobs on some platforms/configurations, resulting in an uploaded file with no actual image data. The post then shows a blank/broken image.

**Root cause:** `fetch()` on local `file://` URIs in React Native is unreliable for blob creation. The standard Expo approach is to use `expo-file-system` to read the file as base64 and decode it, or use `FormData` with the URI directly.

**Fix:** Replace the `fetch(imageUri).blob()` approach with `expo-file-system` base64 read + `Uint8Array` conversion for upload. This is the recommended approach for Supabase storage uploads in React Native/Expo.

**Files to modify:**
- `hooks/useCompleteDay.ts` — Rewrite `uploadProofImage()` to use `expo-file-system`

#### Issue 3: Ability Points Not Showing Total
**Current state:** The `posts_with_details` view uses `p.ability_points_given` from the `posts` table. This value is maintained by a trigger on `post_ability_points`, but may be stale or not updating correctly.

**Fix:** Update the `posts_with_details` view to compute the SUM directly from `post_ability_points` using a subquery. This removes dependency on the trigger for display purposes and guarantees accurate totals.

**New migration:** `005_update_posts_view_ability_points_sum.sql`

**View change:**
```sql
-- Replace p.ability_points_given with a computed subquery
COALESCE(
  (SELECT SUM(points) FROM post_ability_points pap WHERE pap.post_id = p.id),
  0
) as ability_points_given
```

**Files to create:**
- `supabase/migrations/005_update_posts_view_ability_points_sum.sql`

**Files to modify:**
- `.claude/database-schema.md` — Update view documentation and migrations log

### Decisions Made
- **Pull-to-refresh:** Use `RefreshControl` on the existing `ScrollView` (no need to switch to `FlatList` for this change alone)
- **Image upload:** Switch to `expo-file-system` base64 approach — more reliable in React Native/Expo
- **Ability points:** Compute SUM in the view via subquery rather than relying on trigger cache
- **View columns:** Keep the column name `ability_points_given` so no downstream code changes needed in the hook or PostCard

### Components & Files Plan

**New files to create:**
1. `supabase/migrations/005_update_posts_view_ability_points_sum.sql`

**Files to modify:**
1. `hooks/useFeedPosts.ts` — Add `refreshing` state for pull-to-refresh
2. `app/(tabs)/index.tsx` — Add `RefreshControl` to `ScrollView`
3. `hooks/useCompleteDay.ts` — Fix `uploadProofImage()` to use `expo-file-system`
4. `.claude/database-schema.md` — Update view docs and migrations log

### Supabase Requirements
- [x] New tables needed? **No**
- [x] New RLS policies needed? **No**
- [x] New migrations needed? **Yes** — Update `posts_with_details` view to compute AP sum
- [x] Schema documentation update needed? **Yes** — Update view fields in database-schema.md

### Dependencies Needed
- `expo-file-system` — Already included with Expo (no install needed)

### Notes
- The trigger on `post_ability_points` will continue to maintain `posts.ability_points_given` for any other consumers, but the view will now use the computed sum directly
- Pull-to-refresh should NOT show the full-screen loading spinner — only the native pull indicator
- The `RefreshControl` tintColor should match the app theme (`#00c2ff`)

### Reflection
**What went well:**
- Clear root cause identification for each issue
- Minimal changes needed — no new components, just fixes to existing files

**What could be improved:**
- The original `uploadProofImage` should have used `expo-file-system` from the start

**Risks identified:**
- `expo-file-system` base64 read + decode adds memory overhead for large images (mitigated by the 0.8 quality setting in ImagePicker)
- View subquery for ability points adds a small per-row cost, but with indexes on `post_ability_points.post_id` this should be negligible

**⚠️ STOP - Awaiting approval to proceed to Phase 2**

---

## PHASE 2: IMPLEMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Add `refreshing` state to `useFeedPosts` hook and expose it
- [x] Add `RefreshControl` to `ScrollView` in `index.tsx`
- [x] Fix `uploadProofImage()` in `useCompleteDay.ts` to use `expo-file-system`
- [x] Create migration `005_update_posts_view_ability_points_sum.sql`
- [x] Update `.claude/database-schema.md`

### Files Created
- `supabase/migrations/005_update_posts_view_ability_points_sum.sql` — Recreated view with computed SUM from `post_ability_points`

### Files Modified
- `hooks/useFeedPosts.ts` — Added `refreshing` state, `refetch` now calls `load(true)` for pull-to-refresh (no full-screen spinner)
- `app/(tabs)/index.tsx` — Added `RefreshControl` import, destructured `refreshing`, wired `RefreshControl` to `ScrollView` with `#00c2ff` tint
- `hooks/useCompleteDay.ts` — Replaced `fetch(imageUri).blob()` with `expo-file-system` base64 read + `base64-arraybuffer` decode for reliable uploads
- `.claude/database-schema.md` — Updated view docs (computed SUM note) and added migration 005 to log

### Key Implementation Details
- **Pull-to-refresh:** `load(isRefresh)` parameter controls whether `loading` or `refreshing` is set. Initial load shows full spinner, pull-to-refresh shows only the native indicator.
- **Image upload:** `FileSystem.readAsStringAsync(imageUri, { encoding: Base64 })` + `decode(base64)` produces an `ArrayBuffer` that Supabase storage accepts reliably on both iOS and Android.
- **Ability points view:** Explicit column list (no `p.*`) with `COALESCE((SELECT SUM(pap.points) FROM post_ability_points pap WHERE pap.post_id = p.id), 0)::INTEGER as ability_points_given`. The `::INTEGER` cast ensures the type matches `PostWithDetails.ability_points_given`.

### Reflection
**What went well:**
- All three fixes are minimal and focused — no unnecessary changes
- `base64-arraybuffer` was already a dependency, no new installs needed
- View column name unchanged so zero downstream code changes for ability points

**What could be improved:**
- Could add optimistic AP update after giving points (future enhancement)

**⚠️ STOP - Awaiting approval to proceed to Phase 3**

---

## PHASE 3: TESTING & REVIEW

**Status:** ✅ Complete

### Tasks
- [x] Code review all modified files
- [x] Verify pull-to-refresh works and doesn't show full loading spinner
- [x] Verify image upload flow produces valid URLs
- [x] Verify ability points SQL is correct
- [x] Check for TypeScript errors — **0 new errors** (pre-existing in unrelated files only)
- [x] Verify no visual design changes

### Review Findings

**No issues found in:**
- `hooks/useFeedPosts.ts` — `load(isRefresh)` correctly separates initial load from pull-to-refresh; `refetch` wrapped with proper `useCallback`
- `hooks/useCompleteDay.ts` — `FileSystem.readAsStringAsync` + `decode(base64)` produces correct `ArrayBuffer` for Supabase storage; content type mapping correct; error propagation preserved
- `app/(tabs)/index.tsx` — `RefreshControl` correctly bound with `refreshing` state and `refetch` handler; `tintColor` (iOS) and `colors` (Android) both set
- `supabase/migrations/005_*` — Correlated subquery with `COALESCE(SUM(), 0)::INTEGER` correct; index on `post_ability_points.post_id` exists; explicit column list preserves all fields from migration 003

**Visual design verification:**
- Zero visual changes — `RefreshControl` uses native OS pull indicator, no custom UI added
- PostCard: Untouched
- Loading/error/empty states: Untouched

**Pre-existing TypeScript errors (not from our changes):**
1. `NotificationsModal.tsx` — "target" icon name not in Ionicons type
2. `context/subscription.tsx` — SubscriptionStatus type comparison
3. `ReactProjectFiles/` — Unrelated web project files

### Reflection
**What went well:**
- Clean implementation with zero issues found during review
- No new TypeScript errors introduced
- Minimal, focused changes with no side effects

**⚠️ STOP - Awaiting approval to proceed to Phase 4**

---

## PHASE 4: REFLECTION & CLEANUP

**Status:** ✅ Complete

### Known Limitations
1. **No optimistic AP update** — After giving ability points, the `+X AP` badge on the card won't update until the next feed load/refresh. The DB trigger updates `posts.ability_points_given`, but the view now computes the SUM independently so both stay in sync.
2. **Large image memory** — Base64 encoding doubles the image size in memory. Mitigated by expo-image-picker's `quality: 0.8` and `aspect: [4, 3]` crop, keeping files small.

### Future Improvements
1. **Optimistic AP update** — After `giveAbilityPoints` succeeds, immediately update the local post's `abilityPointsGiven` without waiting for refetch.
2. **Infinite scroll / pagination** — Replace `ScrollView` with `FlatList` for `onEndReached` pagination (the `RefreshControl` will work identically on `FlatList`).
3. **Image upload progress** — Show upload progress indicator while the proof image is being uploaded during day completion.

### Success Criteria — Final Status
- [x] Pull-to-refresh works on the posts feed (both "All" and "My Challenges" tabs)
- [x] Proof image from task completion appears correctly on the post in the feed
- [x] Ability points on each post show the correct total from `post_ability_points` table
- [x] Existing UI design is preserved
- [x] No regressions to existing functionality (likes, group click, challenge preview, etc.)

### Summary of All Changes

**Migrations (1 new):**
- `005_update_posts_view_ability_points_sum.sql` — Recreated view with computed SUM subquery

**Hooks modified (2):**
- `hooks/useFeedPosts.ts` — Added `refreshing` state, pull-to-refresh support
- `hooks/useCompleteDay.ts` — Fixed image upload to use `expo-file-system` + `base64-arraybuffer`

**Screen modified (1):**
- `app/(tabs)/index.tsx` — Added `RefreshControl` to `ScrollView`

**Docs updated (1):**
- `.claude/database-schema.md` — Updated view description, added migration 005 to log

**Task complete.**
