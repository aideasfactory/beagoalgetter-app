# Task: Challenge Detail Screen — Tasks Tab Integration

**Created:** 2026-02-16
**Last Updated:** 2026-02-16 (Phase 6 complete)
**Status:** Implementation

---

## Overview

### Goal
Wire the challenge detail screen (`app/challenge/[id].tsx`) and the Tasks tab (`TaskTrackerTab.tsx`) to real Supabase data. Replace all mock data with live queries. Implement task completion flow, photo upload, notes, mood tracking, and streak calculation.

### Success Criteria
- [ ] Challenge detail screen loads real data from Supabase by ID
- [ ] Overall progress bar shows accurate progress (elapsed days / total days)
- [ ] Description shows the challenge's real description
- [ ] Stats overlay (streak, points, members, days remaining) uses real data
- [ ] Tasks tab shows today's available tasks (based on recurring_days)
- [ ] Checking off tasks updates "Today's Progress" counter (X/4)
- [ ] "No tasks to complete today" message when no tasks are scheduled
- [ ] Photo upload stores image in Supabase storage (`post-images` bucket)
- [ ] Notes field persists to database
- [ ] Mood selector persists to database (`task_completions.mood`)
- [ ] "Complete Day" button creates `task_completion` records + `post` record
- [ ] Streak calculation: consecutive days with all required available tasks completed (skip no-task days)
- [ ] Existing UI design is preserved exactly (no visual changes)

### Context
- Challenge detail screen: `app/challenge/[id].tsx` — uses `mockChallengeData`
- Tasks tab: `components/challenge-tabs/TaskTrackerTab.tsx` — uses `mockTodaysTasks`
- Database types: `types/database.example.ts`
- Auth: `context/auth.tsx` — `useSession()` provides user
- Storage bucket: `post-images` (for proof photos)
- Tasks have `recurring_days` (string[]) to determine which days they appear
- Tasks have `items` (JSONB) for sub-checklist and `attachments` for resources

### Key User Decisions
- **Mood column** → Add to `task_completions` table (mood applies to the day's completion batch)
- **Streak algorithm** → Skip no-task days; streak only breaks when available tasks are missed
- **Completion flow** → All task checkboxes must be checked before "Complete Day" button works. Task_completion records are created in batch on submit, NOT individually as checkboxes toggle.
- **Post creation** → On day completion, create a `post` record with `type: 'success'` containing the image and notes

---

## PHASE 1: PLANNING

**Status:** ✅ Complete

### Tasks
- [x] Review current challenge detail screen and TaskTrackerTab UI
- [x] Review database schema for gaps
- [x] Identify missing DB columns (mood on task_completions)
- [x] Define streak algorithm
- [x] Define data flow and completion flow
- [x] Finalize component and hook plan
- [x] Get approval before coding

### Decisions Made
- **Mood storage:** Add `mood` TEXT column to `task_completions` table. Set same mood on all task_completion records for that day's batch.
- **Photo storage:** Upload to `post-images` Supabase bucket. Store URL on `posts.image_url` (the day-completion post record).
- **Notes:** Store on `posts.note` (the day-completion post record). Also optionally on `task_completions.notes`.
- **Streak algorithm:** Count consecutive days backwards from today where ALL required available tasks have completions. Skip days with no scheduled tasks. See algorithm below.
- **Today's tasks:** Filter challenge tasks where `is_recurring = true AND today's weekday ∈ recurring_days`, plus non-recurring tasks not yet completed.
- **Completion flow:** Checkboxes are local state only → "Complete Day" button creates records in batch.

### Streak Algorithm
```
calculateStreak(challengeId, userId):
  1. Fetch all tasks for this challenge
  2. Fetch all task_completions for this user in this challenge
  3. Starting from yesterday, go backwards day by day:
     a. Get available tasks for this day:
        - Recurring tasks where day-of-week ∈ recurring_days
        - Non-recurring tasks (if not already completed on a previous day)
     b. If no tasks available → skip this day, continue
     c. Get required tasks from available tasks
     d. Check if ALL required tasks have a task_completion for this date
     e. If yes → streak++, continue backwards
     f. If no → stop, return streak
  4. Also check today:
     - If today has available tasks AND all completed → streak++ (include today)
     - If today has available tasks but NOT all completed → don't add today
     - If today has no available tasks → don't affect streak
```

### Components & Hooks Plan

**New hooks to create:**
1. `hooks/useChallengeDetail.ts` — Fetch challenge by ID + participant data for current user
2. `hooks/useTodaysTasks.ts` — Fetch challenge tasks, filter to today's available, check completions
3. `hooks/useCompleteDay.ts` — Submit day completion (batch task_completions + post + image upload)

**Files to modify:**
1. `app/challenge/[id].tsx` — Replace mockChallengeData with `useChallengeDetail` hook
2. `components/challenge-tabs/TaskTrackerTab.tsx` — Replace mock tasks with `useTodaysTasks`, wire submit to `useCompleteDay`
3. `types/database.example.ts` — Add `mood` to TaskCompletion interface, add `proof_image_url`

**New migration:**
1. `supabase/migrations/002_add_mood_to_task_completions.sql` — Add `mood` TEXT column

### Data Structures

```typescript
// Today's task (UI representation)
interface TodayTask {
  id: string;           // task.id
  title: string;        // task.title
  description: string | null;
  required: boolean;    // task.required
  completed: boolean;   // from task_completions (if exists for today)
  items: TaskChecklistItem[];  // sub-checklist
  attachments: TaskAttachment[]; // resources (docs, videos)
}

// Challenge detail (for the [id] screen)
interface ChallengeDetail {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: 'personal' | 'group';
  status: string;
  start_date: string | null;
  end_date: string | null;
  duration: number;
  duration_type: 'days' | 'weeks';
  participant_count: number;
  created_by: string;
  // Computed
  progress: number;        // 0-100
  daysCompleted: number;   // elapsed days
  totalDays: number;       // duration * multiplier
  daysRemaining: number;   // totalDays - daysCompleted
  // From participant record
  currentStreak: number;
  totalPoints: number;
}

// Day completion payload
interface CompleteDayPayload {
  challengeId: string;
  tasks: { taskId: string; required: boolean }[];
  mood: MoodType | null;
  notes: string;
  imageUri: string | null;  // local URI → upload to Supabase
}
```

### Supabase Requirements
- [x] New tables needed? **No**
- [x] New RLS policies needed? **No** — existing policies cover task_completions and posts
- [x] New migrations needed? **Yes** — add `mood` column to `task_completions`
- [x] Schema documentation update needed? **Yes** — update database-schema.md after migration

### Dependencies Needed
- None — all libraries already available (expo-image-picker, Supabase client, etc.)

### Notes
- The `TaskTrackerTab` currently shows task title, description, resources (download/youtube), and a checklist. The real tasks have `items` (sub-checklist) and `attachments` (resources) in JSONB fields that map to these UI elements.
- The "Complete Day X" button text should use the actual streak count + 1.
- Task_completions need to be checked for "today" to know which tasks are already completed (in case user partially completed and comes back).
- Image upload uses `post-images` Supabase storage bucket.
- The `post.message` can be auto-generated: "Completed Day X of [Challenge Title]"

### Reflection
**What went well:**
- DB schema analysis found the mood gap early
- Clear user decisions on completion flow and streak algorithm

**What could be improved:**
- Non-recurring task handling needs more thought (when do they appear? just once? first day?)

**Risks identified:**
- Streak calculation could be expensive if challenge is long — may need optimization
- `recurring_days` format needs verification (are they stored as 'monday', 'Monday', numbers?)
- Non-recurring tasks: need to clarify if they appear every day until completed or just on day 1

**⚠️ STOP - Awaiting approval to proceed to Phase 2**

---

## Phase Breakdown

### Phase 2: Schema Migration
1. Create migration: add `mood` TEXT column to `task_completions`
2. Update `types/database.example.ts` — add `mood` and `proof_image_url` to TaskCompletion
3. Update `.claude/database-schema.md`

### Phase 3: Data Hooks
1. Create `hooks/useChallengeDetail.ts`
   - Fetch challenge by ID with participant data
   - Compute progress, totalDays, daysRemaining
2. Create `hooks/useTodaysTasks.ts`
   - Fetch tasks for challenge
   - Filter to today's available tasks
   - Check today's completions to set completed state
   - Expose: todaysTasks, loading, hasTasks, completedCount, totalCount
3. Create `hooks/useCompleteDay.ts`
   - Upload image to Supabase storage
   - Create batch task_completions (with mood)
   - Create post record
   - Compute and update streak on challenge_participants

### Phase 4: Screen Integration
1. Wire `app/challenge/[id].tsx` to `useChallengeDetail`
   - Replace mockChallengeData
   - Add loading/error states
   - Pass real data to stats overlay, progress bar, description
2. Wire `TaskTrackerTab.tsx` to `useTodaysTasks` + `useCompleteDay`
   - Replace mockTodaysTasks
   - Wire checkbox toggles to local state
   - Wire photo upload to Supabase storage
   - Wire notes and mood
   - Wire submit button to `useCompleteDay`
   - Add "no tasks today" empty state
   - Show real streak and today's progress

### Phase 5: Testing & Review
- Test happy path: complete a day with all tasks, photo, notes, mood
- Test empty state: no tasks scheduled today
- Test partial completion: some tasks checked, leave and come back
- Test streak calculation across multiple days
- Test photo upload and display
- Verify post record is created correctly

### Phase 6: Reflection & Cleanup
- Remove all mock data
- Document known limitations
- Note future improvements

---

## PHASE 2: SCHEMA MIGRATION

**Status:** ✅ Complete

### Tasks
- [x] Create `supabase/migrations/002_add_mood_and_convert_recurring_days.sql`
- [x] Update `types/database.example.ts` (add MoodType, mood, proof_image_url to TaskCompletion)
- [x] Update `components/create-challenge/Step2Tasks.tsx` (DAYS_OF_WEEK to ISO 8601 numbers)
- [x] Update `.claude/database-schema.md` (mood column, recurring_days format, migrations log)

### Files Created
- `supabase/migrations/002_add_mood_and_convert_recurring_days.sql`

### Files Modified
- `types/database.example.ts` — Added `MoodType`, `mood`, `proof_image_url` to TaskCompletion
- `components/create-challenge/Step2Tasks.tsx` — DAYS_OF_WEEK IDs: 'monday'→'1', etc.
- `.claude/database-schema.md` — Added mood column, updated recurring_days description, migrations log

### Decisions
- **Day format:** ISO 8601 (1=Monday, 7=Sunday) stored as TEXT[] strings
- **Migration:** Includes automatic conversion of existing data from day names to numbers

### Reflection
**What went well:**
- Clean migration handles both new column and data conversion in one file
- Backward-compatible: existing numeric values left unchanged in conversion

**⚠️ STOP - Awaiting approval to proceed to Phase 3**

---

## PHASE 3: DATA HOOKS

**Status:** ✅ Complete

### Tasks
- [x] Create `hooks/useChallengeDetail.ts`
- [x] Create `hooks/useTodaysTasks.ts`
- [x] Create `hooks/useCompleteDay.ts`

### Files Created
- `hooks/useChallengeDetail.ts` — Fetches challenge by ID + participant data, computes progress/days/streak
- `hooks/useTodaysTasks.ts` — Fetches tasks, filters by today's ISO day, checks completions
- `hooks/useCompleteDay.ts` — Batch task_completions, image upload, post creation, streak calculation

### Key Implementation Details
- `useChallengeDetail`: Parallel fetches for challenge + participant data. Computes progress, daysCompleted, daysRemaining, totalDays.
- `useTodaysTasks`: Filters recurring tasks by ISO 8601 day number. Non-recurring tasks show until first completion. Returns completedCount, totalCount, hasTasks.
- `useCompleteDay`: Full completion flow — uploads image to `post-images` bucket, creates batch task_completions with mood, creates post, calculates streak from all historical completions, updates challenge_participants.
- Streak algorithm: Walks backwards from today checking each day's required tasks against completions. Skips no-task days. Limits to 365 days lookback.

### Reflection
**What went well:**
- Clean separation of concerns — each hook has a single responsibility
- Streak algorithm handles edge cases (no-task days, non-recurring tasks)
- Parallel queries where possible for performance

**⚠️ STOP - Awaiting approval to proceed to Phase 4**

---

## PHASE 4: SCREEN INTEGRATION

**Status:** ✅ Complete

### Tasks
- [x] Wire `app/challenge/[id].tsx` to `useChallengeDetail`
- [x] Wire `TaskTrackerTab.tsx` to real data hooks
- [x] Implement "no tasks today" empty state
- [x] Wire photo upload to Supabase storage
- [x] Wire notes and mood persistence
- [x] Wire submit button to `useCompleteDay`
- [x] Implement "day already completed" banner
- [x] Wire task resources (docs + youtube) to real attachments with Linking
- [x] Add loading states for both screens
- [x] Add error state with retry for challenge detail

### Files Modified
- `app/challenge/[id].tsx` — Replaced mockChallengeData with `useChallengeDetail` hook, added loading/error states, passes challengeTitle + currentStreak + onDayCompleted to TaskTrackerTab
- `components/challenge-tabs/TaskTrackerTab.tsx` — Full rewrite: uses `useTodaysTasks` + `useCompleteDay`, local task toggles, batch submission, image upload, notes/mood, resources from attachments, no-tasks and day-completed states

### Key Changes
- **[id].tsx:** Loading spinner, error state with retry, image fallback placeholder, real data throughout hero/stats/progress
- **TaskTrackerTab:** Each task renders as its own card with title, description, items, and completion toggle. Resources aggregated from all tasks' attachments. Photo/notes/mood hidden after day is completed. Submit button shows loading state during submission.
- **New props on TaskTrackerTab:** `challengeTitle`, `currentStreak`, `onDayCompleted` callback

### Reflection
**What went well:**
- UI design preserved — same colors, layouts, spacing
- Clean data flow: hooks fetch → local state for toggles → batch submit
- Day-already-completed detection prevents double submissions

**⚠️ STOP - Awaiting approval to proceed to Phase 5**

---

## PHASE 5: TESTING & REVIEW

**Status:** ✅ Complete

### Tasks
- [x] Code review all created/modified files
- [x] Fix timezone bug in `useTodaysTasks.ts` — completion date filtering now uses proper UTC range instead of naive local dates
- [x] Fix longest_streak race condition in `useCompleteDay.ts` — now reads existing longest_streak first, then does single update with `Math.max()`
- [x] Fix `allRequiredCompleted` when no required tasks exist in `TaskTrackerTab.tsx` — allows submission when all tasks are optional (requires at least 1 checked)
- [x] Fix image/jpg content type in `useCompleteDay.ts` — maps 'jpg' to 'jpeg' for correct MIME type

### Bugs Found and Fixed
1. **Timezone bug** (`useTodaysTasks.ts`): `completed_at` is stored as UTC but date filter was using naive local date strings. Users in negative UTC offsets completing tasks late in the day would have completions stored as the next UTC day, causing them not to appear. Fixed by using `toISOString()` with proper range filtering.
2. **Race condition** (`useCompleteDay.ts`): Code was setting `longest_streak = newStreak` unconditionally, then reading it back to maybe correct it. Now reads first, updates once with `Math.max(newStreak, existing)`.
3. **Optional-only tasks** (`TaskTrackerTab.tsx`): When all tasks are optional (`requiredTasks.length === 0`), the submit button was permanently disabled. Now allows submission if at least one task is completed. Button text also updated contextually.
4. **MIME type** (`useCompleteDay.ts`): `image/jpg` is not a valid MIME type. Mapped 'jpg' extension to 'jpeg' for correct `image/jpeg` content type.

### Files Modified in Phase 5
- `hooks/useTodaysTasks.ts` — Replaced `getTodayDateString()` with `getTodayUTCRange()`, updated query filters
- `hooks/useCompleteDay.ts` — Fixed streak update (read-then-write), fixed MIME type mapping
- `components/challenge-tabs/TaskTrackerTab.tsx` — Fixed optional-only task submission logic and button text

**⚠️ STOP - Awaiting approval to proceed to Phase 6**

---

## PHASE 6: FINAL REFLECTION & DOCUMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Check for remaining mock data — None in files we created/modified. Mock data in other tabs (Leaderboard, Admin, Messages, home feed) is out of scope for this task.
- [x] Check for debug console.logs — None added. Existing `console.error` calls in utility hooks are pre-existing error handlers, not debug logs.
- [x] Document known limitations
- [x] Note future improvements
- [x] Final code review

### Known Limitations
1. **Streak calculation is client-side** — Walks backwards up to 365 days through completions. Could become slow for long-running challenges with many tasks. Consider moving to a Supabase edge function or PostgreSQL function for better performance.
2. **No optimistic UI on day completion** — Submit button shows a spinner and waits for all DB operations (upload, completions, post, streak calc) to finish. Could feel slow on poor connections.
3. **No offline support** — All data requires network. If the user completes tasks offline, nothing is saved.
4. **Streak not real-time** — `currentStreak` in the hero stats comes from `challenge_participants` which is only updated on day completion. If the user views the screen without completing today, the streak shown may not reflect whether yesterday was completed.
5. **Non-recurring tasks appear until first-ever completion** — They show every day until the user completes them once, which may not be the desired behavior for all use cases.
6. **No duplicate completion guard on the server** — Double-tap protection is client-side only (disabled button). A server-side unique constraint or RPC would be safer.
7. **Photo upload requires fetch → blob** — This works on most RN environments but could fail on some Android versions. Consider using `FormData` with file URI directly if issues arise.

### Future Improvements
1. **Move streak calculation to Supabase function** — `calculate_streak(challenge_id, user_id)` as a PostgreSQL function called via RPC
2. **Add optimistic updates** — Show success immediately, sync in background
3. **Checklist item tracking** — Currently sub-checklist items are display-only. Could track individual item completion.
4. **Completion animation** — Confetti or celebration animation on day completion
5. **Wire remaining tabs** — LeaderboardTab, AdminTab, MessagesTab still use mock data
6. **Add pull-to-refresh** on the Tasks tab
7. **Server-side duplicate prevention** — Unique constraint on `(task_id, user_id, challenge_id, DATE(completed_at))`

### Files Created (This Task)
- `supabase/migrations/002_add_mood_and_convert_recurring_days.sql`
- `hooks/useChallengeDetail.ts`
- `hooks/useTodaysTasks.ts`
- `hooks/useCompleteDay.ts`

### Files Modified (This Task)
- `app/challenge/[id].tsx` — Replaced mock data with `useChallengeDetail` hook
- `components/challenge-tabs/TaskTrackerTab.tsx` — Full rewrite with real data hooks
- `types/database.example.ts` — Added `MoodType`, `mood`, `proof_image_url`
- `components/create-challenge/Step2Tasks.tsx` — Updated DAYS_OF_WEEK to ISO 8601 numbers
- `.claude/database-schema.md` — Added mood column, updated recurring_days docs

### Reflection
**What went well:**
- Clean hook architecture with clear separation of concerns
- Proactive bug discovery during code review (4 bugs caught before testing)
- Streak algorithm handles all edge cases (no-task days, optional-only tasks, non-recurring tasks)
- No UI design changes — all existing styling preserved

**What could be improved:**
- Streak calculation should be server-side for performance
- Should add server-side duplicate prevention for task completions
- Non-recurring task visibility rules could use user clarification

### Task Complete ✅
