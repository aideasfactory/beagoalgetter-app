# Task: Fix Challenge Banner Image Display

**Created:** 2026-03-08
**Last Updated:** 2026-03-08
**Status:** In Progress

---

## Overview

### Goal
Remove the dark gradient/opacity overlay from challenge banner images on the Challenges screen so images display clearly and vibrantly. Maintain text readability for any text overlaid on the banners.

### Success Criteria
- [ ] Dark gradient overlay removed from ChallengeCard banner images
- [ ] Banner images display in full, original colors
- [ ] Text overlaid on banners (title, description, badges) remains readable
- [ ] No regressions to card layout or functionality

### Context
- **ChallengeCard:** `components/ChallengeCard.tsx` — displays challenge cards in 2-column grid on Challenges tab
- **Current overlay:** LinearGradient with colors `['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']` covering entire 160px banner
- **Overlaid elements:** Type badge (top-left), member count (top-right), title + description (bottom)
- **Text readability concern:** Title and description sit at the bottom of the image — need alternative readability approach

---

## PHASE 1: PLANNING

**Status:** 🔄 In Progress

### Tasks
- [x] Review ChallengeCard component structure
- [x] Identify overlay elements and their readability needs
- [x] Plan approach for removing gradient while keeping text readable
- [x] Identify all files to modify

### Analysis

**Current structure (lines 60-109 of ChallengeCard.tsx):**
1. `<View style={{ height: 160 }}>` — container
2. `<Image>` — banner image (full width/height)
3. `<LinearGradient>` — absolute overlay covering entire image with heavy black opacity (0.7 → 0.5 → 0.95)
4. Badges (top) — type badge + member count, already have their own backgrounds (`${color}40`, `bg-white/20`)
5. Title + description (bottom) — white text, no individual background, relies entirely on the gradient for contrast

**Problem:** The gradient colors are extremely dark (70% to 95% black opacity), making the banner image barely visible.

**Solution approach:**
- Remove the full-coverage LinearGradient entirely
- Replace with a smaller, lighter gradient at the bottom only (where title/description text lives) to ensure text readability
- Keep existing badge backgrounds (they already have their own semi-transparent backgrounds)
- Add text shadow to title/description for additional readability on varied image backgrounds

### Files Plan

**New files to create:**
- None

**Files to modify:**
- `components/ChallengeCard.tsx` — Remove full gradient, add bottom-only lighter gradient for text area, add text shadows

### Supabase Requirements
- No database changes needed

### Decisions Made
- **Bottom-only gradient:** Replace full-cover heavy gradient with a bottom-third gradient that's lighter — enough to make text readable without darkening the entire image
- **Text shadows:** Add textShadow styles to title/description for extra contrast on varied backgrounds
- **Keep badge backgrounds:** Badges already have semi-transparent backgrounds, no changes needed

### Reflection
**What went well:**
- Simple, focused task with one file to modify
- Clear understanding of the overlay structure

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 2: IMPLEMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Remove the full-coverage LinearGradient overlay
- [x] Add bottom-only gradient for text readability (lighter)
- [x] Add text shadows to title and description
- [x] Verify badge styling remains intact

### Currently Working On
Complete

### Files Modified
- `components/ChallengeCard.tsx` — Replaced full-coverage gradient with bottom-only gradient, added text shadows

### Implementation Details
**Gradient change:**
- Before: `colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}` covering full image (100% height)
- After: `colors={['transparent', 'rgba(0,0,0,0.7)']}` covering bottom 60% only — fades from transparent to dark only where text lives

**Text shadows added:**
- Both title and description text now have `textShadowColor: 'rgba(0,0,0,0.75)'` with `textShadowRadius: 3` for extra readability

**Badges:** No changes needed — type badge and member count already have their own semi-transparent backgrounds

### Reflection
**What went well:**
- Simple, surgical change — only 2 edits needed
- Bottom-only gradient preserves text readability while letting the top portion of the image show in full color

**What could be improved:**
- Could consider adding text shadow to badge text as well for extra safety on very light images

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 3: REFLECTION & CLEANUP

**Status:** ✅ Complete

### Tasks
- [x] Self-review checklist
- [x] Document any limitations
- [x] Final reflection

### Self-Review Checklist
- [x] All phase tasks checked off
- [x] Code follows project patterns (NativeWind + inline styles where needed)
- [x] NativeWind/Tailwind classes used for styling
- [x] No console.log statements left
- [x] current-task.md updated with progress

### Reflection
**What went well:**
- Minimal, focused change — only touched what needed to change
- The bottom-only gradient approach is a clean pattern that lets the image shine while keeping text readable

**What could be improved:**
- N/A — straightforward task executed cleanly

---

## TASK COMPLETE

**Completed:** 2026-03-08

### Final Summary
Removed the heavy full-coverage dark gradient overlay from ChallengeCard banner images and replaced it with a lighter bottom-only gradient that preserves text readability. Added text shadows to title and description for additional contrast. Banner images now display vibrantly with their original colors visible.

### Known Limitations
- On very bright/light banner images, the top-area badges (type badge, member count) may have slightly reduced contrast since the top gradient was removed. However, they have their own semi-transparent backgrounds that provide adequate readability.

### Future Improvements
- Could add text shadows to badge text for extra safety on very light images if needed

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-08-fix-challenge-banner-overlay.md`
