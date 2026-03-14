# Task: Handle pre-start challenge state correctly on joined posts and challenge progress labels

**Created:** 2026-03-14
**Last Updated:** 2026-03-14T15:00:00Z
**Status:** Complete

---

## Overview

### Goal
Build correct pre-start behaviour for joined challenge posts: show "Challenge starts on X" instead of "Day X of Y" when a challenge hasn't started, and block ability-point giving with a clear alert message.

### Context
- Tile ID: 019cecb9-d97e-7233-bbae-7a72d4cc51de
- Repository: beagoalgetter-app
- Branch: feature/019cecb9-d97e-7233-bbae-7a72d4cc51de-handle-pre-start-challenge-state-correctly-on-joined-posts-a
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Analysis
- `PostCard.tsx` renders posts with a `challengeDay` field showing "Day X of Y"
- `useFeedPosts.ts` computes `challengeDay` from challenge start_date but doesn't check if the challenge has actually started
- Trophy/ability-points action on `PostCard` calls `onGivePoints` with no pre-start guard
- `index.tsx` handles `onGivePoints` by opening `GivePointsModal` directly

### Plan
1. Add `challengeStartDate` and `challengeHasStarted` fields to Post interface
2. Compute `challengeHasStarted` in `useFeedPosts.ts` mapPostToFeedPost
3. Update PostCard day label to show "Challenge starts on X" when not started
4. Intercept trophy action in index.tsx to show Alert when challenge not started

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Changes Made

1. **`components/PostCard.tsx`**
   - Added `challengeStartDate?: string | null` and `challengeHasStarted?: boolean` to `Post` interface
   - Updated day label rendering: shows orange "Challenge starts on Mar 20, 2026" when `challengeHasStarted === false`, otherwise shows normal "Day X of Y"

2. **`hooks/useFeedPosts.ts`**
   - Added `challengeHasStarted` computation comparing challenge start_date to today
   - Passes `challengeStartDate` and `challengeHasStarted` through to FeedPost

3. **`app/(tabs)/index.tsx`**
   - Added `Alert` import
   - Updated `handleGivePoints` to check `post.challengeHasStarted` — if false, shows an Alert with the start date and returns early instead of opening the GivePointsModal

### Self-Review
- [x] All phase tasks checked off
- [x] Code follows project patterns
- [x] NativeWind/Tailwind classes used for styling
- [x] Error handling in place
- [x] TypeScript types defined
- [x] No console.log statements left
- [x] current-task.md updated with progress

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### What Worked Well
- Clean data flow: start-state computed once in the feed mapper, consumed by PostCard and the feed screen
- Minimal changes: only 3 files modified, no new components or hooks needed
- Consistent with existing patterns (e.g., `useChallengeDetail.ts` already computes `hasStarted` the same way)

### Technical Debt
- None introduced. The approach mirrors the existing `hasStarted` pattern from `useChallengeDetail.ts`.

### Files Changed
- `components/PostCard.tsx` — Post interface + day label rendering
- `hooks/useFeedPosts.ts` — challengeHasStarted computation + field mapping
- `app/(tabs)/index.tsx` — Alert import + pre-start guard on ability points

---

## TASK COMPLETE
All requirements addressed:
- ✅ "X joined a challenge" posts reviewed
- ✅ Pre-start challenge state detected correctly
- ✅ Trophy/ability-points blocked with clear alert when challenge not started
- ✅ "Day X of Y" replaced with "Challenge starts on X" for pre-start challenges
- ✅ Start date displayed accurately from challenge data
- ✅ Works correctly both before and after challenge starts
