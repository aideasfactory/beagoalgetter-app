# Task: Fix Logout Crash

**Created:** 2026-03-09
**Last Updated:** 2026-03-09
**Status:** Complete

---

## Overview

### Goal
Fix the logout functionality — tapping "Log Out" was crashing the app instead of signing the user out.

### Success Criteria
- [x] Tapping "Log Out" signs the user out without crashing
- [x] User is redirected to the auth/login screen after logout
- [x] No unnecessary state resets (hasLaunched stays true)

---

## PHASE 1: PLANNING & FIX

**Status:** ✅ Complete

### Root Causes Identified
1. **`router.replace('/')` navigates to a non-existent route** — there is no `app/index.tsx`, so this crashes
2. **`setHasLaunched(false)` is incorrect** — resets the user to onboarding instead of the login screen
3. **`AsyncStorage.clear()` is too aggressive** — clears Supabase's internal auth storage, causing race conditions during teardown
4. **Manual navigation is unnecessary** — `Stack.Protected` guards in `_layout.tsx` already handle routing automatically when `session` becomes `null`

### Fix Applied
Simplified `signOut()` in `context/auth.tsx` to:
1. Call `supabase.auth.signOut()` (wrapped in try/catch)
2. Call `setSession([null, null])` in `finally` block

Removed:
- `AsyncStorage.clear()` — unnecessary and harmful
- `setStorageItemAsync('session', null)` — `setSession([null, null])` handles this via the hook
- `setHasLaunched(false)` — user should see login, not onboarding
- `router.replace('/')` — `Stack.Protected` guards handle navigation automatically

Cleaned up unused imports: `AsyncStorage`, `setStorageItemAsync`

### Files Modified
- `context/auth.tsx` — Simplified `signOut` function, removed unused imports

### Reflection
**What went well:**
- The `Stack.Protected` guard system in `_layout.tsx` already handles all navigation logic correctly — the signOut function was overcomplicating things by trying to manually navigate

**What could be improved:**
- N/A

---

## TASK COMPLETE

**Completed:** 2026-03-09

### Final Summary
Fixed logout crash caused by `router.replace('/')` navigating to a non-existent route, combined with aggressive state resets (`AsyncStorage.clear()`, `setHasLaunched(false)`) that caused race conditions. Simplified `signOut()` to just clear the Supabase session and reset local session state, letting the existing `Stack.Protected` navigation guards handle the redirect automatically.

### Known Limitations
- None

### Future Improvements
- None

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-09-fix-logout-crash.md`
