# Task: Onboarding & Auth Screen Improvements

**Created:** 2026-03-08
**Last Updated:** 2026-03-08
**Status:** Complete

---

## Overview

### Goal
Fix two issues with the onboarding/auth flow:
1. **Auth background too light** — The background image on login/signup screens is too light, causing input fields to conflict visually
2. **Onboarding content update** — Rewrite the 3 onboarding slides with new themes:
   - Slide 1: About the app
   - Slide 2: Social feed & social proof (succeeding/failing in challenges)
   - Slide 3: Teams — join and work as a team

### Success Criteria
- [x] Auth screen (login/signup) background is darker so inputs are clearly visible
- [x] Onboarding slide 1 covers what the app is about
- [x] Onboarding slide 2 covers social feed and social proof
- [x] Onboarding slide 3 covers team collaboration

### Context
- **AuthScreen:** `components/AuthScreen.tsx` — uses Unsplash yoga image with gradient overlay
- **Onboarding:** `components/Onboarding.tsx` — 3-slide carousel with Unsplash backgrounds
- Both use dark theme with cyan (#00c2ff) accent

---

## PHASE 1: PLANNING

**Status:** ✅ Complete

### Tasks
- [x] Review current AuthScreen styling
- [x] Review current Onboarding content
- [x] Plan background fix approach
- [x] Plan new slide content

### Analysis
- AuthScreen gradient was `[0.9, 0.8, 1.0]` opacity — the 0.8 in the middle let too much image through where inputs sit
- Onboarding slides had generic fitness themes, needed specific app-related content

### Reflection
**What went well:** Clear requirements, straightforward changes

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 2: FIX AUTH SCREEN BACKGROUND

**Status:** ✅ Complete

### Tasks
- [x] Darken gradient overlay on AuthScreen
- [x] Darken gradient overlay on Onboarding slides

### Files Modified
- `components/AuthScreen.tsx` — Gradient changed from `[0.9, 0.8, 1.0]` at `[0, 0.5, 1]` to `[0.85, 0.92, 1.0]` at `[0, 0.4, 0.85]`
- `components/Onboarding.tsx` — Gradient changed from `[0.7, 0.6, 1.0]` at `[0, 0.6, 1]` to `[0.6, 0.75, 1.0]` at `[0, 0.5, 0.85]`

### Implementation Details
- AuthScreen: Increased mid-section darkness from 0.8 to 0.92 opacity — inputs sit in this zone, so it needed the most darkening. Pushed the solid black start point from 1.0 to 0.85 so the bottom third is fully black.
- Onboarding: Made gradient transition more gradual, with stronger darkening toward the bottom where text content sits.

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 3: UPDATE ONBOARDING SLIDES

**Status:** ✅ Complete

### Tasks
- [x] Update slide 1: About the app — "Be a Goal Getter"
- [x] Update slide 2: Social feed & social proof — "Share Your Journey"
- [x] Update slide 3: Teams & collaboration — "Stronger Together"
- [x] Update icons to match new themes
- [x] Select appropriate background images

### Files Modified
- `components/Onboarding.tsx` — Updated all 3 slides

### Slide Changes

| | Old | New |
|---|---|---|
| **Slide 1** | "Be a Goal Getter" / `disc-outline` / running track | "Be a Goal Getter" / `rocket-outline` / gym workout |
| **Slide 2** | "Track Progress" / `trending-up` / gym workout | "Share Your Journey" / `megaphone-outline` / friends group |
| **Slide 3** | "Challenge Yourself" / `people` / group fitness | "Stronger Together" / `people` / team huddle |

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 4: REFLECTION & CLEANUP

**Status:** ✅ Complete

### Tasks
- [x] Review all changes
- [x] Update task file
- [x] Write sentinel file

### Reflection
**What went well:**
- Minimal, focused changes — only modified the 2 files that needed updating
- Kept existing UI structure intact, just updated content and gradients

**What could be improved:**
- May want to test on device to fine-tune the exact gradient opacity values
- Background images are from Unsplash URLs — could consider using local assets for offline reliability

---

## TASK COMPLETE

**Completed:** 2026-03-08

### Final Summary
Darkened the gradient overlays on both the AuthScreen (login/signup) and Onboarding slides to prevent background images from conflicting with input fields and text content. Updated all 3 onboarding slides with new themed content: Slide 1 about the app, Slide 2 about the social feed and accountability, Slide 3 about teams and collaboration.

### Known Limitations
- Background images are loaded from Unsplash URLs (requires network)
- Gradient darkness values may need fine-tuning on physical devices

### Future Improvements
- Consider bundling onboarding images as local assets for offline-first experience
- Could add subtle parallax or animation to background images

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-08-onboarding-auth-improvements.md`
