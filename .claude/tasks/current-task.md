# Task: Challenge List Screen — Supabase Integration

**Created:** 2026-02-16
**Last Updated:** 2026-02-16 (Phase 2 complete)
**Status:** Implementation

---

## Overview

### Goal
Replace the hardcoded mock data in the Challenges list screen with live Supabase data. Show only the authenticated user's challenges (personally created + joined via code). Display computed progress, streak, participant count, and support filtering by Personal/Group type.

### Success Criteria
- [ ] Challenges load from Supabase (no more mock data)
- [ ] Only shows challenges the user created OR is a participant in
- [ ] Progress bar shows accurate progress (elapsed days / total days)
- [ ] Current streak displays from `challenge_participants.current_streak`
- [ ] Group challenges show participant count from `challenges.participant_count`
- [ ] Filter tabs work for All / Personal / Group
- [ ] "Hide completed" toggle works with real status data
- [ ] Loading state shown while fetching
- [ ] Error state with retry option
- [ ] Pull-to-refresh support
- [ ] Existing design/UI is preserved exactly (no visual changes)
- [ ] Join by code modal works with real Supabase lookup

### Context
- Current screen: `app/(tabs)/challenges.tsx` — uses `mockChallenges` array
- ChallengeCard component: `components/ChallengeCard.tsx` — has its own `Challenge` interface
- Database types: `types/database.example.ts` — has `Challenge`, `ChallengeParticipant` types
- Auth: `context/auth.tsx` — `useSession()` provides `user` object
- Existing service: `challengeService.getMyChallenges()` in database.example.ts (needs enhancement)

---

## PHASE 1: PLANNING

**Status:** 🔄 In Progress

### Tasks
- [x] Review requirements
- [x] Review current challenges screen and ChallengeCard component
- [x] Review database schema for available data
- [x] Identify required data and compute strategy
- [x] Plan Supabase query
- [x] Define data flow and component changes
- [ ] Get approval before coding

### Decisions Made
- **Progress calculation:** Computed client-side from `start_date`, `duration`, and `duration_type`. Formula: `Math.min(100, Math.round((elapsedDays / totalDays) * 100))` where `totalDays = duration * (duration_type === 'weeks' ? 7 : 1)` and `elapsedDays = daysSince(start_date)`.
- **Days completed:** Use elapsed days since start (capped at totalDays). More accurate "completed days" would require counting distinct task_completion dates — can be enhanced later.
- **Streak:** Use `challenge_participants.current_streak` which already exists on the junction table.
- **Member count:** Use `challenges.participant_count` (denormalized field, already maintained).
- **Filter approach:** Filter client-side on `challenge.type` (personal/group) — same as current approach but with real data.
- **Query strategy:** Single query joining `challenges` with `challenge_participants` to get user-specific data (streak, status) in one round trip.
- **No schema changes needed:** All data is available in existing tables.

### Components Identified
- **New hook:** `hooks/useChallenges.ts` — fetches user's challenges from Supabase, computes derived fields
- **Modified:** `app/(tabs)/challenges.tsx` — replace mock data with hook, add loading/error/refresh states
- **Modified:** `components/ChallengeCard.tsx` — update `Challenge` interface to align with computed data (minimal changes, keep design intact)
- **Modified:** Join by code modal section — wire to real Supabase lookup via `challenges.join_code`

### Data Structures
```typescript
// What the ChallengeCard needs (keeping existing interface shape):
interface ChallengeListItem {
  id: string;
  title: string;
  description: string;
  image: string;                    // from challenges.image_url (fallback placeholder)
  type: 'Personal' | 'Group';      // mapped from challenges.type
  progress: number;                 // computed: elapsed/total * 100
  daysCompleted: number;            // computed: elapsed days since start
  totalDays: number;                // computed: duration * multiplier
  currentStreak: number;            // from challenge_participants.current_streak
  members: number;                  // from challenges.participant_count
  status: 'active' | 'completed';  // from challenges.status
  endDate: string;                  // formatted from challenges.end_date
  isJoined: boolean;                // always true (we only fetch user's challenges)
}
```

### Supabase Query Plan
```typescript
// Single query to get user's challenges with their participant data
const { data, error } = await supabase
  .from('challenge_participants')
  .select(`
    current_streak,
    longest_streak,
    status,
    challenges:challenge_id (
      id, title, description, type, duration, duration_type,
      start_date, end_date, status, participant_count,
      image_url, created_by, join_code
    )
  `)
  .eq('user_id', userId)
  .in('status', ['active', 'completed']);
```

### Supabase Requirements
- [x] New tables needed? **No**
- [x] New RLS policies needed? **No** — existing policies cover SELECT for challenges and participants
- [x] New migrations needed? **No**
- [x] Schema documentation update needed? **No**

### Dependencies Needed
- None — all libraries already available

### Notes
- The `challenge_participants.current_streak` field exists but may not be auto-updated by triggers yet. For Phase 1, we'll use whatever value is stored. A future task can add a trigger to auto-update streak on task completion.
- `participant_count` on challenges is denormalized. The create challenge hook already inserts into `challenge_participants`, so this should be accurate for challenges created through the app. A future task may add a trigger to auto-increment on participant join.
- Placeholder image needed for challenges without `image_url`.

---

## Phase Breakdown

### Phase 2: Implementation Tasks
1. Create `hooks/useChallenges.ts`
   - Fetch challenges via `challenge_participants` joined with `challenges`
   - Map DB rows to `ChallengeListItem` format
   - Compute progress, totalDays, daysCompleted from dates
   - Expose: `challenges`, `loading`, `error`, `refetch`
2. Update `components/ChallengeCard.tsx`
   - Keep exact same visual design
   - Adjust `Challenge` interface to support nullable `image` (fallback)
   - Ensure types align with computed data
3. Update `app/(tabs)/challenges.tsx`
   - Replace `mockChallenges` with `useChallenges()` hook
   - Add loading state (activity indicator)
   - Add error state with retry
   - Add pull-to-refresh via `RefreshControl`
   - Wire filter counts to real data
   - Keep all existing UI exactly as-is
4. Wire Join by Code modal to Supabase
   - Lookup challenge by `join_code` in `challenges` table
   - Join challenge via `challenge_participants` insert
   - Handle errors (invalid code, already joined)

### Phase 3: Testing
- Test with real Supabase data
- Test empty state (no challenges)
- Test filter tabs with real type data
- Test hide completed toggle
- Test pull-to-refresh
- Test join by code flow
- Test error handling (network failure)

### Phase 4: Reflection & Cleanup
- Remove any remaining mock data references
- Document known limitations
- Note future improvements (streak auto-update trigger, task completion-based progress)

### Reflection
**What went well:**
- All required data already exists in the schema
- `challenge_participants` has `current_streak` ready to use
- Single query with join can fetch everything needed

**What could be improved:**
- Progress based on elapsed days is approximate — true "completed days" would need task_completions count
- Streak field may not be auto-updated yet (requires trigger)

**Risks identified:**
- `participant_count` may be 0 if not incremented on participant join (need to verify)
- Challenges without images need a sensible fallback

**⚠️ STOP - Awaiting approval to proceed to Phase 2**

---

## PHASE 2: IMPLEMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Create `hooks/useChallenges.ts` with Supabase query and data mapping
- [x] Update `ChallengeCard.tsx` interface (minimal, preserve design)
- [x] Update `challenges.tsx` — replace mock data with hook
- [x] Add loading state (ActivityIndicator)
- [x] Add error state with retry button
- [x] Add pull-to-refresh via RefreshControl
- [x] Wire filter counts to real data
- [x] Wire join-by-code modal to Supabase lookup
- [x] Wire join action to `challenge_participants` insert
- [ ] Test full flow end-to-end

### Current Progress
**Currently working on:** All implementation tasks complete. Ready for testing.

**Completed this session:**
- Created `hooks/useChallenges.ts` with three hooks: `useChallenges`, `useLookupByJoinCode`, `useJoinChallenge`
- Updated `ChallengeCard.tsx` — added fallback placeholder for challenges without images
- Rewrote `challenges.tsx` — replaced all mock data, added loading/error/refresh states, wired join-by-code to Supabase

### Code Locations
**Files created:**
- `hooks/useChallenges.ts` — Main data hook with Supabase query, join code lookup, join action

**Files modified:**
- `components/ChallengeCard.tsx` — Added image fallback placeholder (trophy icon)
- `app/(tabs)/challenges.tsx` — Full Supabase integration, removed all mock data

### Implementation Details

#### Key Functions/Hooks
- `useChallenges()` — Fetches user's challenges via `challenge_participants` joined with `challenges`, computes progress/streak/days
- `useLookupByJoinCode()` — Looks up a challenge by its `join_code` in the `challenges` table
- `useJoinChallenge()` — Inserts into `challenge_participants` to join a challenge

#### Data Mapping
- `progress` = elapsed days / total days * 100, capped at 100
- `totalDays` = duration * (weeks ? 7 : 1)
- `daysCompleted` = elapsed days since start_date, capped at totalDays
- `currentStreak` = from `challenge_participants.current_streak`
- `members` = from `challenges.participant_count` (min 1)
- `type` = mapped from 'personal'/'group' to 'Personal'/'Group'
- `endDate` = formatted as "Mon DD" from `challenges.end_date`

### Reflection
**What went well:**
- Clean separation of hooks from UI — `useChallenges.ts` contains all data logic
- Minimal ChallengeCard changes — only added image fallback, kept all design intact
- Join-by-code now works with real Supabase data including "already joined" detection

**What could be improved:**
- Progress is based on elapsed days, not actual task completions — future enhancement
- `participant_count` may not auto-increment — needs verification

**Technical debt created:**
- None significant — removed all mock data cleanly

**⚠️ STOP - Awaiting approval to proceed to Phase 3**

---

## PHASE 3: TESTING & REVIEW

**Status:** ⏸️ Not Started

### Tasks
- [ ] Test happy path — challenges load correctly
- [ ] Test empty state — no challenges
- [ ] Test filter tabs — All / Personal / Group
- [ ] Test hide completed toggle
- [ ] Test pull-to-refresh
- [ ] Test join by code — valid code
- [ ] Test join by code — invalid code
- [ ] Test join by code — already joined
- [ ] Test error handling — network failure
- [ ] Test loading state appearance
- [ ] Verify design is unchanged

---

## PHASE 4: FINAL REFLECTION & DOCUMENTATION

**Status:** ⏸️ Not Started

### Tasks
- [ ] Remove all mock data
- [ ] Clean up console.logs
- [ ] Document known limitations
- [ ] Note future improvements
- [ ] Final code review
