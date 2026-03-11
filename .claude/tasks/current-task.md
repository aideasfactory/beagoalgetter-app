# Task: Add camera capture and upload support for challenge evidence photos

**Created:** 2026-03-11
**Last Updated:** 2026-03-11T19:15:00Z
**Status:** ✅ Complete

---

## 📋 Overview

### Goal
Add image capture and upload support for challenge evidence so users can either
use their camera directly or upload an existing image from their device.

### Success Criteria
- [x] Review the current evidence image flow in Goal Getter
- [x] Users can take a photo directly with the camera
- [x] Users can upload an existing image from their device
- [x] This works when creating a challenge
- [x] This works when signing off a day of a challenge in the evidence section
- [x] The image flow feels clear and consistent in both places
- [x] Captured or uploaded images are saved and attached correctly to challenge evidence
- [x] Permissions, error handling, and device compatibility are handled properly

### Context
- Tile ID: 019cd90e-9f8f-73ea-9823-4f2c5861b879
- Repository: beagoalgetter-app
- Branch: feature/019cd90e-9f8f-73ea-9823-4f2c5861b879-add-camera-capture-and-upload-support-for-challenge-evidence-photos
- Priority: MEDIUM

---

## PHASE 1: PLANNING — ✅ Complete

### Analysis
- `expo-image-picker` v17 already installed — supports `launchCameraAsync()` and `launchImageLibraryAsync()`
- Camera permissions pre-configured in `app.json` for iOS and Android
- Two locations use image picking: `Step1Basics.tsx` and `TaskTrackerTab.tsx`
- No new packages or database changes needed

### Approach
- Create shared `useImagePicker` hook with ActionSheet for camera/library selection
- Update both consumer components to use the new hook

---

## 🔨 PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Create `hooks/useImagePicker.ts` — shared hook with ActionSheet, camera/library permissions, configurable aspect/quality
- [x] Update `TaskTrackerTab.tsx` — replaced inline image picker with `useImagePicker`, updated UI text
- [x] Update `Step1Basics.tsx` — replaced inline image picker with `useImagePicker`, updated UI text and icon

---

## 💭 PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Reflection
The implementation was straightforward because `expo-image-picker` already supports both camera and library via separate launch functions. The key architectural decision was to create a shared `useImagePicker` hook that encapsulates the ActionSheet presentation and permission handling, keeping both consumer components clean. No database or storage changes were needed — the existing upload pipelines work identically regardless of whether the image came from the camera or the library.

### What went well
- Clean separation of concerns via the shared hook
- No new dependencies required
- Permissions were already configured
- Consistent UX in both locations (same ActionSheet pattern)

### Self-Review Checklist
- [x] All phase tasks checked off
- [x] Code follows project patterns
- [x] NativeWind/Tailwind classes used for styling
- [x] Error handling in place (permission denials, cancellations)
- [x] TypeScript types defined
- [x] No console.log statements left
- [x] Supabase queries use proper error handling (unchanged existing logic)
- [x] current-task.md updated with progress
- [x] Reflection section filled out

### TASK COMPLETE
- **Files created:** `hooks/useImagePicker.ts`
- **Files modified:** `components/challenge-tabs/TaskTrackerTab.tsx`, `components/create-challenge/Step1Basics.tsx`
- **Database changes:** None
- **New dependencies:** None
