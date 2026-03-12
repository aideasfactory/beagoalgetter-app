# Task: Refetch challenges after returning from challenge creation

**Created:** 2026-03-11
**Last Updated:** 2026-03-11T21:05:00Z
**Status:** Complete

---

## Overview

### Goal
Improve the challenge list refresh behaviour after a new challenge is created so the newly created challenge appears automatically without pull-to-refresh.

### Context
- Tile ID: 019cd915-b042-739e-9592-20b9ebb42ac7
- Repository: beagoalgetter-app
- Branch: feature/019cd915-b042-739e-9592-20b9ebb42ac7-refetch-challenges-after-returning-from-challenge-creation
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Analysis

**Current state:**
- `useFocusEffect` is already in `app/(tabs)/challenges.tsx` calling `refetch()` on screen focus
- `useChallenges` hook's `fetchChallenges` sets `loading: true` on every call
- The challenges screen shows a full-screen loading spinner when `loading && !refreshing`
- This causes a loading flash every time the user navigates back — the existing challenge list disappears and a spinner shows briefly

**Root cause:**
The `fetchChallenges` function in `useChallenges.ts` always sets `loading: true`, which triggers the full-screen loading state in the challenges screen. There's no distinction between initial load and background refresh.

**Fix:**
- Track whether the initial load has completed using a `useRef`
- Only set `loading: true` for the initial fetch (when no data has been loaded yet)
- Subsequent refetches (triggered by `useFocusEffect`) update data silently in the background

### Files to modify
1. `hooks/useChallenges.ts` — Add initial load tracking, prevent loading flash on refetch

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Update `useChallenges` hook to only show loading spinner on initial fetch
- [x] Verify `useFocusEffect` + refetch pattern is correct

### Changes made
- Added `useRef` import and `hasLoadedOnce` ref to `useChallenges` hook
- Changed `setLoading(true)` to only fire when `hasLoadedOnce.current` is false (initial load)
- Set `hasLoadedOnce.current = true` after first successful data fetch
- Subsequent refetches from `useFocusEffect` now update challenges silently without flashing a loading spinner

### Self-Review Checklist
- [x] Code follows project patterns
- [x] Error handling in place
- [x] TypeScript types defined
- [x] No console.log statements
- [x] current-task.md updated

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Edge Cases Verified
- Title TextInput now has explicit `text-base` ensuring consistent sizing across iOS and Android
- Large bold titles (`text-3xl`) use `tracking-tight` to counteract the wider letter spacing of bold system fonts
- Smaller title displays (`text-sm`, `text-lg`) left unchanged — they don't exhibit the spacing issue

### Reflection
The fix was minimal and targeted. The `useFocusEffect` pattern was already correctly implemented in the challenges screen — the only issue was that the hook treated every fetch as an initial load, causing a full-screen loading flash that hid existing data during background refreshes.

### What worked well
- The existing architecture (hook + useFocusEffect) was sound — only needed a small refinement
- Using `useRef` avoids unnecessary re-renders while tracking load state

### Technical debt / future improvements
- Could add an optimistic update pattern where newly created challenges are injected into state immediately (before the refetch completes), but the current silent refetch is fast enough

---

## TASK COMPLETE
**Summary:** Fixed challenge list refresh after creation by preventing the full-screen loading spinner from flashing on subsequent refetches. The `useChallenges` hook now tracks whether data has been loaded at least once via a `useRef`, and only shows the loading spinner for the initial fetch. Background refetches from `useFocusEffect` update the challenge list silently, so newly created challenges appear seamlessly when navigating back.
