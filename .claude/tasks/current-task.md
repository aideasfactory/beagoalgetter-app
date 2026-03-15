# Task: Review and restore over-the-air update checks on launch and background launch

**Created:** 2026-03-15
**Last Updated:** 2026-03-15T11:25:00Z
**Status:** ✅ Complete

---

## Overview

### Goal
Fix over-the-air update checking so it works on both normal launch and background/foreground resume.

### Context
- Tile ID: 019cf10d-eb83-7043-8d4b-240804c2d798
- Repository: beagoalgetter-app
- Branch: feature/019cf10d-eb83-7043-8d4b-240804c2d798-review-and-restore-over-the-air-update-checks-on-launch-and-
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Investigation Findings

**Current implementation:**
- `hooks/useAppUpdates.ts` — main hook using `expo-updates` with lazy loading
- `components/UpdateToast.tsx` — animated toast UI for update status
- `app/_layout.tsx` — integrates `useAppUpdates()` and `UpdateToast`
- `app.json` — `checkAutomatically: "ON_LOAD"`, `enabled: true`

**Issues identified:**

1. **No AppState listener for foreground resume** — The hook had no `AppState` listener. When the app returned from background, no update check was triggered.

2. **No explicit `checkForUpdateAsync()` on mount** — The hook relied entirely on `Updates.useUpdates()` reactive state + the native `ON_LOAD` config. No programmatic call to `checkForUpdateAsync()` on mount.

3. **`checkForUpdate` was unused** — The function was exposed from the hook but never called anywhere.

### Reflection
Investigation was straightforward. The hook was well-structured but simply missing the two key trigger points (mount and resume).

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Add AppState import and listener for background→foreground transitions
- [x] Add explicit `checkForUpdateAsync()` on mount
- [x] Add cooldown logic (5 min) to prevent redundant checks
- [x] Self-review checklist

### Changes Made
- **`hooks/useAppUpdates.ts`** — Added `AppState` listener that triggers `checkForUpdate()` when app becomes active. Added mount effect that calls `checkForUpdate()` on cold launch. Added 5-minute cooldown via `useRef` to prevent excessive API calls. Integrated cooldown into the `checkForUpdate` callback so both manual and automatic checks respect it.

### Reflection
Clean implementation. The cooldown prevents the mount check and an immediate foreground event from double-firing. The existing reactive flow (useUpdates → fetchUpdateAsync → reloadAsync) was already correct and didn't need changes.

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### What was accomplished
Fixed OTA update checks by adding two missing trigger points: an explicit check on cold launch mount and an AppState listener for background→foreground resume. Added a 5-minute cooldown to prevent redundant checks.

### Technical debt
None introduced. The implementation is minimal and follows existing patterns.

### Files changed
- `hooks/useAppUpdates.ts`

---

## TASK COMPLETE
**Summary:** Reviewed and fixed the OTA update flow. The hook was missing an explicit `checkForUpdateAsync()` call on mount and had no `AppState` listener for foreground resume. Added both with a 5-minute cooldown to prevent excessive checks. The existing download/reload reactive flow was already correct.
