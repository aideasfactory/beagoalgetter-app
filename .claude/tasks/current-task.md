# Task: Update create-group settings copy to reflect broader goal-based use cases

**Created:** 2026-03-12
**Last Updated:** 2026-03-12
**Status:** ✅ Complete

---

## Overview

### Goal
Update the create-group messaging on the profile/settings page to reflect Goal Getter's broader purpose — achieving goals of all kinds, not just fitness.

### Context
- Tile ID: 019ce2f3-05dc-7270-8ab7-1a1a818b7fd2
- Branch: feature/019ce2f3-05dc-7270-8ab7-1a1a818b7fd2-update-create-group-settings-copy-to-reflect-broader-goal-ba

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Files modified
1. `app/(tabs)/profile/index.tsx` — React Native profile screen
2. `ReactProjectFiles/src/components/Profile.tsx` — Web reference component

### Copy changes
| Location | Old Copy | New Copy |
|----------|----------|----------|
| Card subtitle | Start your own fitness community and challenge friends together | Create a group to chase goals together — from reading challenges to accountability circles and beyond |
| Modal instruction | Fill in the details to create your own fitness group | Fill in the details to create your goal group |

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

- [x] Update card subtitle in `app/(tabs)/profile/index.tsx` (line 456)
- [x] Update modal instruction in `app/(tabs)/profile/index.tsx` (line 527)
- [x] Update card subtitle in `ReactProjectFiles/src/components/Profile.tsx` (line 283)
- [x] Update modal instruction in `ReactProjectFiles/src/components/Profile.tsx` (line 304)
- [x] Commit changes

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### Reflection
- Straightforward copy update across 2 files (4 string changes total)
- Existing headings ("Create Your Own Group", "Create New Group") were already goal-agnostic and needed no changes
- The bio field in the web reference file still says "Fitness enthusiast" but that's mock user data, not app copy — left untouched
- No database or schema changes required

### TASK COMPLETE
All fitness-focused create-group copy has been replaced with broader goal-based messaging.
