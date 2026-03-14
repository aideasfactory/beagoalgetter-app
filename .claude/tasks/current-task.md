# Task: Standardise Goal Getter icons

**Created:** 2026-03-14
**Last Updated:** 2026-03-14T11:15:00Z
**Status:** Complete

---

## Overview

### Goal
Standardise all "ringed blue icon" treatments across the Goal Getter app to use consistent colour, shape, and sizing.

### Context
- Tile ID: 019ce3cb-5a27-70fa-869f-9b84ffaa7d18
- Repository: beagoalgetter-app
- Branch: feature/019ce3cb-5a27-70fa-869f-9b84ffaa7d18-standardise-goal-getter-icons
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Audit Findings

**Inconsistencies identified across 7 files:**

1. **Avatar.tsx** — Used `bg-blue-600` (Tailwind blue) instead of brand cyan `#00c2ff`
2. **challenge/[id].tsx** — Stat icons used `rounded-xl` (rounded square) instead of `rounded-full` (circle)
3. **Mixed sizes** — Icon circles varied: w-8/h-8, w-10/h-10, w-12/h-12 across similar contexts
4. **No reusable component** — Icon circle pattern duplicated ~15+ times with inline styles
5. **Inconsistent style approach** — Some used `style={{ backgroundColor }}`, others used NativeWind `bg-[]` classes

### Standardisation Rules

| Property | Standard | Notes |
|----------|----------|-------|
| Brand cyan | `#00c2ff` | All blue icon circles use this |
| Semi-transparent | `{color}20` (12.5% opacity) | Consistent tint backgrounds |
| Shape | `rounded-full` | All icon circles are perfect circles |
| Small size | w-8 h-8, icon 18px | Feature list checkmarks |
| Medium size | w-10 h-10, icon 20px | Stat cards, notifications |
| Large size | w-12 h-12, icon 24px | Detail cards, community |

### Reflection
Planning complete. Clear set of inconsistencies identified with straightforward fixes.

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Tasks
- [x] Create `IconCircle` component with size variants (sm, md, lg) and solid/tint variants
- [x] Update `Avatar.tsx` — changed `bg-blue-600` to `#00c2ff`
- [x] Update `challenge/[id].tsx` — changed `rounded-xl` to `rounded-full` on all 4 stat icons via IconCircle
- [x] Update `NotificationsModal.tsx` — replaced inline icon circles with IconCircle
- [x] Update `JoinChallengeModal.tsx` — replaced all 9 inline icon circles (4 stats + 4 checkmarks + 1 community) with IconCircle
- [x] Update `challenges.tsx` — replaced join-by-code icon with IconCircle
- [x] Update `AdminTab.tsx` — replaced settings icon circle with IconCircle

### Self-Review Checklist
- [x] All phase tasks checked off
- [x] Code follows project patterns (functional components, TypeScript)
- [x] NativeWind/Tailwind classes used for styling
- [x] TypeScript types defined (IoniconsName, IconCircleProps)
- [x] No console.log statements
- [x] current-task.md updated

### Reflection
All icon circle instances now use the centralised `IconCircle` component. The `rounded-xl` squares on the challenge detail page are now `rounded-full` circles. The Avatar component now uses the brand cyan `#00c2ff` instead of Tailwind's `bg-blue-600`. The component supports custom colours for non-cyan icons (green, purple, orange) used in stat grids.

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### What Was Done
- Created a reusable `IconCircle` component with 3 size variants (sm/md/lg) and 2 style variants (solid/tint)
- Standardised all icon circle instances across 7 files to use consistent shape (`rounded-full`), colours (`#00c2ff` as default), and the centralised component
- Fixed `Avatar.tsx` using wrong blue shade (`bg-blue-600` → `#00c2ff`)
- Fixed `challenge/[id].tsx` using wrong shape (`rounded-xl` → `rounded-full`)

### Files Changed
1. `components/IconCircle.tsx` (NEW)
2. `components/Avatar.tsx`
3. `components/NotificationsModal.tsx`
4. `components/JoinChallengeModal.tsx`
5. `components/challenge-tabs/AdminTab.tsx`
6. `app/challenge/[id].tsx`
7. `app/(tabs)/challenges.tsx`

### Technical Debt
- None introduced. The `IconCircle` component actually reduces existing debt by centralising a repeated pattern.

### Future Improvements
- Could extend `IconCircle` to support custom icon sizes beyond the 3 presets if needed
- The leaderboard team rank circles use text (not Ionicons) inside circles — these could get a companion `TextCircle` component if needed

---

## TASK COMPLETE
All phases executed successfully. Icon treatments are now visually standardised across the app.
