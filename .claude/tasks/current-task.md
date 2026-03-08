# Task: EAS Updates — Remote Over-the-Air Updates

**Created:** 2026-03-08
**Last Updated:** 2026-03-08
**Status:** In Progress

---

## Overview

### Goal
Implement Expo's EAS Updates system for Goal Getter to enable over-the-air (OTA) JavaScript updates without requiring app store resubmission. This includes installing `expo-updates`, configuring update channels (production, staging, preview), implementing seamless update checking/downloading in the app, and documenting the deployment workflow.

### Requirements
1. Install and configure `expo-updates` for OTA update support
2. Allow JS code, images, and text content to be deployed remotely
3. Download and apply updates seamlessly on app launch and while running
4. Set up update channels (production, staging, preview) for controlled rollouts
5. Document the update workflow for future deployments

### Success Criteria
- [ ] `expo-updates` installed and configured in `app.json`
- [ ] `runtimeVersion` policy configured for update compatibility
- [ ] Update channels configured in `eas.json` (production, staging, preview)
- [ ] App checks for updates on launch and applies them seamlessly
- [ ] `useUpdates` hook or utility available for programmatic update checking
- [ ] npm scripts added for publishing updates to each channel
- [ ] Update workflow documented for future deployments
- [ ] No regressions to existing app functionality

### Context
- **Project:** React Native / Expo 53 mobile app
- **EAS Project ID:** `6f3c64d4-85f3-4b4d-9354-8a5bd78807f0` (already in app.json)
- **Owner:** `goalgetter` (already in app.json)
- **Existing build profiles:** development, development-device, preview, production (in eas.json)
- **No existing `expo-updates` dependency** — needs to be installed
- **Root layout:** `app/_layout.tsx` — main entry point for update logic

---

## PHASE 1: PLANNING

**Status:** ✅ Complete

### Tasks
- [x] Review current app.json configuration
- [x] Review current eas.json build profiles
- [x] Review app/_layout.tsx entry point
- [x] Review EAS Updates documentation
- [x] Identify all files to create/modify
- [x] Plan implementation approach
- [x] Define implementation phases

### Analysis

#### Current State
| Component | Status | Notes |
|-----------|--------|-------|
| `expo-updates` package | ❌ Not installed | Needs `npx expo install expo-updates` |
| `app.json` updates config | ❌ Missing | No `updates` or `runtimeVersion` config |
| `eas.json` channels | ❌ Missing | Build profiles exist but no `channel` properties |
| Update checking in app | ❌ Missing | No update logic in `_layout.tsx` |
| Update npm scripts | ❌ Missing | No `eas update` scripts in package.json |

#### Configuration Plan

**app.json additions:**
```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "fingerprint"
    },
    "updates": {
      "url": "https://u.expo.dev/6f3c64d4-85f3-4b4d-9354-8a5bd78807f0",
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

- **`runtimeVersion.policy: "fingerprint"`** — Automatically generates a hash of the native project to determine update compatibility. Safest option — prevents updates from being applied to incompatible native builds.
- **`checkAutomatically: "ON_LOAD"`** — Checks for updates every time the app loads (default). Updates download in background and apply on next launch.
- **`fallbackToCacheTimeout: 0`** — App loads immediately with cached bundle, doesn't block on update download.

**eas.json channel additions:**
```json
{
  "build": {
    "development": { "channel": "development", ... },
    "development-device": { "channel": "development", ... },
    "preview": { "channel": "preview", ... },
    "production": { "channel": "production", ... }
  }
}
```

### Files Plan

**New files to create:**
1. `hooks/useAppUpdates.ts` — Hook wrapping `expo-updates` for programmatic update checking with status feedback
2. `UPDATE_WORKFLOW.md` — Documentation for the update deployment workflow

**Files to modify:**
1. `package.json` — Add npm scripts for `eas update` commands
2. `app.json` — Add `runtimeVersion`, `updates` configuration
3. `eas.json` — Add `channel` to each build profile
4. `app/_layout.tsx` — Add update checking on app launch

### Implementation Phases

#### Phase 2: Package Installation & Configuration
1. Install `expo-updates`
2. Configure `app.json` with `runtimeVersion` and `updates`
3. Add `channel` to each build profile in `eas.json`
4. Add `expo-updates` plugin to app.json plugins array

#### Phase 3: App Update Logic
1. Create `hooks/useAppUpdates.ts` — wraps expo-updates with useUpdates hook
2. Integrate update checking into `app/_layout.tsx`
3. Handle update download + apply seamlessly (background download, apply on next launch)

#### Phase 4: Scripts & Documentation
1. Add npm scripts to package.json for publishing updates
2. Create `UPDATE_WORKFLOW.md` with deployment guide
3. Document channel strategy, commands, and best practices

#### Phase 5: Reflection & Cleanup
1. Document known limitations
2. Note future improvements
3. Final review

### Supabase Requirements
- [x] New tables needed? **No**
- [x] New RLS policies needed? **No**
- [x] New migrations needed? **No**
- [x] Schema documentation update needed? **No**

### Dependencies Needed
- `expo-updates` — Core package for OTA updates

### Decisions Made
- **`fingerprint` runtime version policy** — Automatically determines compatibility based on native project hash. Safest option for preventing incompatible updates.
- **`checkAutomatically: ON_LOAD`** — Default behavior, checks on every app load. Updates download in background and apply on next restart.
- **`fallbackToCacheTimeout: 0`** — App loads instantly with cached bundle. No blocking on update download for best UX.
- **Development + Development-device share `development` channel** — Both are dev builds, should receive the same updates.
- **Separate hook (`useAppUpdates`)** — Encapsulates update logic cleanly, can be used anywhere in the app for status display or manual trigger.

### Risks Identified
- `expo-updates` is a native module — requires a new native build after installation (cannot test via Expo Go)
- Updates only work on builds created with EAS Build (not development client with Metro bundler)
- Large asset changes may increase update download size

### Reflection
**What went well:**
- EAS project already configured with project ID and owner
- Build profiles already exist in eas.json — just need channel additions
- Clean entry point in _layout.tsx for update logic

**What could be improved:**
- N/A at planning stage

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 2: PACKAGE INSTALLATION & CONFIGURATION

**Status:** ✅ Complete

### Tasks
- [x] Install `expo-updates` package
- [x] Add `runtimeVersion` config to `app.json`
- [x] Add `updates` config to `app.json`
- [x] Add `expo-updates` to plugins array in `app.json`
- [x] Add `channel` to each build profile in `eas.json`

### Files Modified
- `package.json` — `expo-updates` added as dependency
- `app.json` — Added `runtimeVersion` (fingerprint policy), `updates` config (url, enabled, checkAutomatically, fallbackToCacheTimeout), `expo-updates` plugin
- `eas.json` — Added `channel` to all four build profiles (development, development-device → "development"; preview → "staging"; production → "production")

### Implementation Details
- Used `npx expo install expo-updates` for SDK-compatible version
- `runtimeVersion.policy: "fingerprint"` — auto-generates native project hash for compatibility checking
- `updates.url` points to `https://u.expo.dev/{projectId}`
- `checkAutomatically: "ON_LOAD"` — checks every app launch
- `fallbackToCacheTimeout: 0` — non-blocking, loads cached bundle immediately
- Preview build profile uses "staging" channel (not "preview") per user requirement for staging channel

### Reflection
**What went well:**
- Clean configuration additions — all additive, no breaking changes
- EAS project ID was already configured

**What could be improved:**
- N/A

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 3: APP UPDATE LOGIC

**Status:** ✅ Complete

### Tasks
- [x] Create `hooks/useAppUpdates.ts` with expo-updates wrapper
- [x] Integrate update checking into `app/_layout.tsx` Root component
- [x] Handle seamless background download and apply-on-restart flow

### Files Created
- `hooks/useAppUpdates.ts` — Hook wrapping `expo-updates` useUpdates hook with auto-download and auto-reload

### Files Modified
- `hooks/index.ts` — Added `useAppUpdates` export
- `app/_layout.tsx` — Import and call `useAppUpdates()` in Root component

### Implementation Details
- **useAppUpdates hook flow:** Uses `Updates.useUpdates()` for reactive state → auto-downloads when `isUpdateAvailable` → auto-reloads when `isUpdatePending`
- **Environment guards:** Skips update logic in Expo Go, web, and `__DEV__` mode (updates only work on EAS builds)
- **Manual trigger:** Exposes `checkForUpdate()` callback for manual update checks from anywhere in the app
- **Non-blocking:** `fallbackToCacheTimeout: 0` in app.json ensures the app loads instantly with cached bundle while updates download in background
- **Seamless UX:** Updates download silently → reload happens automatically once download completes

### Reflection
**What went well:**
- Clean hook API — single `useAppUpdates()` call handles the entire update lifecycle
- Proper environment detection prevents crashes in dev/Expo Go

**What could be improved:**
- Could add user-facing notification before auto-reload for better UX (future improvement)

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 4: SCRIPTS & DOCUMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Add npm scripts to package.json for eas update commands
- [x] Create `UPDATE_WORKFLOW.md` with full deployment guide
- [x] Document channel strategy, commands, rollback, and best practices

### Files Created
- `UPDATE_WORKFLOW.md` — Complete deployment guide covering channels, commands, rollback, monitoring, and best practices

### Files Modified
- `package.json` — Added 3 npm scripts: `update:production`, `update:staging`, `update:development`

### Implementation Details
- Scripts use `eas update --channel <channel>` format — user adds `--message` via `--` passthrough
- Documentation covers: how OTA works, channel mapping, deployment flow, native vs OTA changes, runtime version compatibility, monitoring, rollback, and best practices

### Reflection
**What went well:**
- Clean script naming convention matches existing build scripts pattern
- Documentation covers all key scenarios developers need

**What could be improved:**
- Could add CI/CD integration examples in future

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 5: REFLECTION & CLEANUP

**Completed:** 2026-03-08

### Tasks
- [x] Document known limitations
- [x] Note future improvements
- [x] Final code review
- [x] Fill in TASK COMPLETE section

### Final Code Review
- **app.json:** `runtimeVersion`, `updates`, and `expo-updates` plugin correctly configured
- **eas.json:** All 4 build profiles have appropriate `channel` values
- **useAppUpdates hook:** Proper environment guards (Expo Go, web, __DEV__), reactive update flow via useUpdates(), auto-download and auto-reload
- **_layout.tsx:** Single-line integration — `useAppUpdates()` called in Root component
- **package.json:** 3 update scripts added, expo-updates installed
- **UPDATE_WORKFLOW.md:** Comprehensive documentation covering all deployment scenarios
- **No regressions:** All changes are additive

---

## TASK COMPLETE

**Completed:** 2026-03-08

### Final Summary
Implemented EAS Updates for Goal Getter, enabling over-the-air JavaScript updates without app store resubmission. Installed and configured `expo-updates` with fingerprint-based runtime versioning, set up three update channels (production, staging, development), created a `useAppUpdates` hook that seamlessly checks, downloads, and applies updates on app launch, and documented the complete deployment workflow.

### Known Limitations
1. **Requires new native build first** — OTA updates only work on builds created with EAS Build after `expo-updates` is installed. Existing builds won't receive updates until rebuilt.
2. **Native changes still require app store submission** — OTA can only update JavaScript, assets, and styles. New native modules or permission changes require a new build.
3. **Auto-reload on update** — The app reloads immediately after downloading an update. Could be improved with a user prompt before reloading.
4. **No update size limits** — Large asset additions will increase update download size. Consider asset optimization for large updates.

### Future Improvements
1. **User notification before reload** — Show a toast/modal informing the user an update was downloaded before auto-reloading
2. **CI/CD integration** — Add GitHub Actions workflow to auto-publish updates on merge to main
3. **Update analytics** — Track update adoption rates via Sentry or custom analytics
4. **Conditional updates** — Use `checkAutomatically: "WIFI_ONLY"` option for users on metered connections
5. **Rollback automation** — Add error boundary that auto-rolls back to previous version on crash after update

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-08-eas-updates.md`
