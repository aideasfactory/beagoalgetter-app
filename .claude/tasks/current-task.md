# Task: Investigate and fix the stray line appearing at the top of the app

**Created:** 2026-03-11
**Last Updated:** 2026-03-11T19:16:35Z
**Status:** Planning

---

## 📋 Overview

### Goal
Investigate the thin stray line visible at the very top of the Goal Getter app,
identify its source, and remove it without breaking toast notifications or the
rest of the top-level layout.

### Success Criteria
- [ ] Source of the stray line identified
- [ ] Unwanted line removed
- [ ] Toast behaviour still works correctly
- [ ] Top-level layout remains intact
- [ ] Relevant screens or app states checked

### Context
- Tile ID: 019cd909-9d32-71a7-a429-4cf6e57f3cb2
- Repository: beagoalgetter-app
- Branch: feature/019cd909-9d32-71a7-a429-4cf6e57f3cb2-investigate-and-fix-the-stray-line-appearing-at-the-top-of-the-app
- Priority: MEDIUM
- Customer: Goal Getter
- Due: None provided

---

## 🎯 PHASE 1: PLANNING
**Status:** ✅ Complete

### Root Cause
The `UpdateToast` component (`components/UpdateToast.tsx`) animates to `translateY: -100` when hidden. However, the inner card starts at `mt-16` (64px) and is ~54px tall, totaling ~118px from the top of the parent. With only -100px offset, the bottom ~18px of the bordered card (`border border-gray-700`) remains visible on screen — appearing as a thin stray line.

### Fix Plan
- Increase the hidden `translateY` value from `-100` to `-200` in both the initial value and the animation target
- This ensures the entire toast (including border) is fully off-screen when not visible

---

## 🔨 PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

### Changes Made
- `components/UpdateToast.tsx`: Changed hidden `translateY` from `-100` to `-200` in both the initial `Animated.Value` and the spring animation target
- This ensures the entire toast card (including its border) is fully off-screen when not visible
- When visible, the toast still animates to `translateY: 0` (unchanged)
- Toast behaviour is unaffected — only the hidden position changed

---

## 💭 PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Reflection
The stray line was caused by the `UpdateToast` component not being fully hidden off-screen. The initial `translateY` offset of -100px was insufficient to hide a card that extended ~118px from the top of its parent container. Increasing the offset to -200px ensures the entire card (including its 1px border) is fully off-screen in all cases.

### Impact Assessment
- **Toast behaviour**: Unaffected — the toast still slides in from the top when visible
- **Layout**: No impact — the toast uses absolute positioning and doesn't affect document flow
- **Performance**: No impact — same animation, just a different target value
- **Other screens**: The fix applies globally since UpdateToast is rendered in the root layout

### Technical Debt
- None introduced

## TASK COMPLETE
- **Files changed:** `components/UpdateToast.tsx`
- **Tests written:** No (visual fix, no testable logic change)
- **Summary:** Fixed stray line at top of app by increasing the UpdateToast hidden translateY offset from -100 to -200, ensuring the bordered card is fully off-screen when not visible.
