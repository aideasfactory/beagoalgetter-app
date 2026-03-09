# Task: Forgot Password System

**Created:** 2026-03-09
**Last Updated:** 2026-03-09
**Status:** Complete

---

## Overview

### Goal
Implement a complete Forgot Password flow using Supabase Auth. Users request a password reset email, click the link to return to the app, and enter a new password — all within the app's dark-themed auth UI.

### Success Criteria
- [x] "Forgot Password?" on login navigates to `/forgot-password`
- [x] Forgot-password screen restyled to match dark auth theme
- [x] `resetPasswordForEmail` includes `redirectTo` URL
- [x] `confirm.tsx` handles `type=recovery` → navigates to `/reset-password`
- [x] `reset-password.tsx` created with new password + confirm form
- [x] `supabase.auth.updateUser({ password })` called on submit
- [x] `reset-password` screen added to navigation stack
- [x] i18n translation keys added
- [x] No regressions to existing auth flow

---

## PHASE 1: PLANNING — ✅ Complete

### Files Plan
**Create:** `app/reset-password.tsx`
**Modify:** `context/auth.tsx`, `app/confirm.tsx`, `app/forgot-password.tsx`, `app/_layout.tsx`, `components/AuthScreen.tsx`, `locales/en.json`

### Decisions
- Reuse `confirm.tsx` for recovery deep links (same as magic link)
- `redirectTo: 'goalgetter://confirm'` using app scheme
- `updateUser({ password })` for setting new password with active session
- All screens match dark auth theme

---

## PHASE 2: AUTH CONTEXT & DEEP LINK HANDLING — ✅ Complete

### Tasks
- [x] Update `resetPassword()` with `redirectTo: 'goalgetter://confirm'`
- [x] Add `updatePassword()` method to auth context
- [x] Update `confirm.tsx` to handle `type=recovery`

### Files Modified
- `context/auth.tsx` — Added `redirectTo` to `resetPasswordForEmail`, added `updatePassword` method + type
- `app/confirm.tsx` — Added `type === 'recovery'` handling → navigates to `/reset-password`

---

## PHASE 3: SCREENS — ✅ Complete

### Tasks
- [x] Create `app/reset-password.tsx` (dark theme, password + confirm form)
- [x] Restyle `app/forgot-password.tsx` to match dark auth theme
- [x] Add i18n translation keys to `locales/en.json`

### Files Created
- `app/reset-password.tsx` — New password form with Zod validation, dark theme, success state

### Files Modified
- `app/forgot-password.tsx` — Full restyle with dark background, gradient overlay, logo, back arrow
- `locales/en.json` — Added 11 new translation keys for password reset flow

---

## PHASE 4: NAVIGATION & WIRING — ✅ Complete

### Tasks
- [x] Add `reset-password` and `confirm` to `_layout.tsx` Stack (outside Protected guards)
- [x] Update `AuthScreen.tsx` "Forgot Password?" to navigate to `/forgot-password`

### Files Modified
- `app/_layout.tsx` — Added `confirm` and `reset-password` screens outside Protected guards
- `components/AuthScreen.tsx` — Changed "Forgot Password?" to `router.push('/forgot-password')`, removed unused `resetPassword` destructure

---

## PHASE 5: REFLECTION & CLEANUP — ✅ Complete

### Final Code Review
- **context/auth.tsx:** `resetPassword` includes `redirectTo`, `updatePassword` method properly typed and returns boolean
- **confirm.tsx:** Handles both `magiclink` and `recovery` types, routes recovery to `/reset-password`
- **forgot-password.tsx:** Dark theme matches AuthScreen, back arrow nav, email form with Zod, confirmation state
- **reset-password.tsx:** Password + confirm fields, Zod refine for match, show/hide toggle, success state with icon
- **_layout.tsx:** `confirm` and `reset-password` outside Protected guards (accessible in any auth state)
- **AuthScreen.tsx:** "Forgot Password?" navigates to page instead of calling reset directly
- **No regressions:** Existing magic link and auth flows unchanged

---

## TASK COMPLETE

**Completed:** 2026-03-09

### Final Summary
Implemented a complete Forgot Password system using Supabase Auth. The flow: user taps "Forgot Password?" on login → navigates to styled forgot-password screen → enters email → receives reset email → clicks link → deep link opens app via confirm screen → session set from recovery tokens → navigates to reset-password screen → user enters new password with confirmation → `supabase.auth.updateUser({ password })` saves it. All screens match the dark auth theme with cyan accents.

### Known Limitations
1. **Supabase redirect URL setup required** — `goalgetter://confirm` must be added to the Supabase project's allowed redirect URLs in the dashboard
2. **Recovery token expiration** — Supabase recovery links expire (typically 1 hour) — user must click promptly
3. **Other locale files not updated** — Only `en.json` has the new translation keys; other locales (de, es, fr, etc.) need translations added

### Future Improvements
1. **Rate limiting UI** — Show feedback if user requests too many reset emails
2. **Password strength indicator** — Visual meter for password strength on reset-password screen
3. **Email pre-fill** — Pass email from forgot-password to reset-password for display

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-09-forgot-password-system.md`
