# Task: Add group location capture to match the group details view

**Created:** 2026-03-12
**Last Updated:** 2026-03-12T20:35:00Z
**Status:** Complete

---

## Overview

### Goal
Add location capture to the create/edit group flow so it matches the group details view which already displays location.

### Context
- Tile ID: 019ce359-d8b8-7074-95a1-d3dccac43ec2
- Repository: beagoalgetter-app
- Branch: feature/019ce359-d8b8-7074-95a1-d3dccac43ec2-add-group-location-capture-to-match-the-group-details-view
- Priority: MEDIUM

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Key Findings
- DB `groups` table already has `location` TEXT column (nullable)
- TypeScript `Group` type already has `location: string | null`
- `GroupInfoModal` displays `group.location` but doesn't handle empty values
- `CreateGroupInput` / `UpdateGroupInput` missing `location`
- Create group form doesn't collect location

### Decisions
- Location is **optional** — not all groups have a physical location
- No DB migration needed
- Field placed after Inception Date in the form

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

- [x] Add `location` to `CreateGroupInput` and `UpdateGroupInput` in `services/group.ts`
- [x] Pass `location` in the `createGroup()` insert object
- [x] Add `groupLocation` state to profile screen
- [x] Add location TextInput to create/edit group modal
- [x] Pass `location` in `handleSaveGroup` for both create and update
- [x] Populate `groupLocation` in `handleEditGroup`
- [x] Reset `groupLocation` in `resetGroupForm`
- [x] Handle empty location in `GroupInfoModal` (shows "Not set")
- [x] Also handle empty founded in `GroupInfoModal` for consistency

### Self-Review Checklist
- [x] All phase tasks checked off
- [x] Code follows project patterns (NativeWind, existing form field style)
- [x] NativeWind/Tailwind classes used for styling
- [x] Error handling in place (existing handleSaveGroup error handling covers this)
- [x] Loading states implemented (existing isSavingGroup state covers this)
- [x] TypeScript types defined (location added to service interfaces)
- [x] No console.log statements added
- [x] Supabase queries use proper error handling
- [x] current-task.md updated with progress

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### What was done
- Added `location` field to the service layer interfaces (`CreateGroupInput`, `UpdateGroupInput`)
- Added location TextInput to the create/edit group modal form
- Wired location through the full create → save → display flow
- Added graceful fallback ("Not set") for empty location and founded fields in the group details modal

### What went well
- The database and TypeScript type already supported `location`, so no migration was needed
- The change was minimal and surgical — only 3 files modified
- Followed existing patterns exactly (same TextInput style, same state management pattern)

### Technical debt
- None introduced

### Files changed
- `services/group.ts` — Added `location` to input interfaces and insert call
- `app/(tabs)/profile/index.tsx` — Added `groupLocation` state, form field, and wiring
- `components/GroupInfoModal.tsx` — Added "Not set" fallback for empty location/founded

---

## TASK COMPLETE
All phases executed successfully. The create/edit group flow now captures location, which is saved to the database and displayed in the group details modal.
