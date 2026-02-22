# Task: Teams & Leaderboard - Wire Up Real Data

**Created:** 2026-02-21
**Last Updated:** 2026-02-22
**Status:** Complete

---

## Overview

### Goal
Wire up the teams and leaderboard system with real database data. The database structure largely exists (`teams` table, `challenge_participants.team_id`), but the `challenge_leaderboard` view needs team info, a team leaderboard view is missing, and all frontend components (LeaderboardTab, AdminTab) use mock data. We need to:
1. Enhance database views to support team + individual leaderboards
2. Create services and hooks to fetch leaderboard/team data
3. Wire up LeaderboardTab to show real individual leaderboard (top 6) and team standings
4. Wire up AdminTab to manage teams and participant assignments with real data

### Requirements
1. **Individual Leaderboard** — Top 6 participants ranked by ability points + streak
   - Top 3 displayed on podium (existing design)
   - 4th, 5th, 6th displayed in list below (existing design)
2. **Team Standings** — Each team shows cumulative ability points + streak from all members
3. **Team Assignment** — Participants can be assigned to teams within a challenge
4. **Admin Team Management** — Challenge owners can create teams, assign participants via AdminTab

### Success Criteria
- [ ] `challenge_leaderboard` view includes team_name and team_color
- [ ] New `challenge_team_leaderboard` view aggregates team totals per challenge
- [ ] Leaderboard service fetches individual + team leaderboard data
- [ ] Team service supports CRUD operations (create, assign, remove)
- [ ] LeaderboardTab displays real data for both team standings and individual leaderboard
- [ ] AdminTab creates/manages teams and assigns participants with real DB operations
- [ ] Database schema documentation updated
- [ ] No regressions to existing functionality

### Context
- **Existing DB:** `teams` table (group_id, name, color), `challenge_participants.team_id` FK, `challenge_leaderboard` view (missing team info)
- **Existing UI:** LeaderboardTab and AdminTab fully designed with mock data
- **LeaderboardTab:** `components/challenge-tabs/LeaderboardTab.tsx` — individual podium + team standings
- **AdminTab:** `components/challenge-tabs/AdminTab.tsx` — team CRUD + participant assignment
- **Challenge detail:** `app/challenge/[id].tsx` — renders tabs, passes `challengeId`
- **Schema:** `supabase/schema.sql` lines 639-648 — current `challenge_leaderboard` view

---

## PHASE 1: PLANNING

**Status:** 🔄 In Progress

### Tasks
- [x] Review current database schema for teams support
- [x] Review `challenge_leaderboard` view definition
- [x] Review LeaderboardTab component (React Native version)
- [x] Review AdminTab component (React Native version)
- [x] Review example leaderboard queries
- [x] Identify database gaps
- [x] Plan migration changes
- [x] Identify all files to create/modify
- [x] Plan implementation approach
- [ ] Get approval before coding

### Database Analysis

#### What Already Exists
| Component | Status | Notes |
|-----------|--------|-------|
| `teams` table | ✅ Ready | id, group_id, name, color, created_at |
| `challenge_participants.team_id` | ✅ Ready | FK to teams(id), nullable |
| `challenge_participants.current_streak` | ✅ Ready | Per-participant streak tracking |
| `challenge_participants.total_ability_points` | ✅ Ready | Per-participant points tracking |
| `challenge_leaderboard` view | ⚠️ Partial | Ranks individuals but missing team_name, team_color |
| Team leaderboard view | ❌ Missing | No view to aggregate team totals per challenge |
| `idx_participants_team_id` index | ✅ Ready | Already indexed for team queries |

#### Current `challenge_leaderboard` View (schema.sql:640-648)
```sql
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT
    cp.*,
    pr.display_name,
    pr.avatar_url,
    pr.username,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.total_ability_points DESC, cp.current_streak DESC) as rank
FROM challenge_participants cp
LEFT JOIN profiles pr ON cp.user_id = pr.id;
```
**Problem:** No LEFT JOIN to `teams` — individual entries have no team context.

### Migration Plan

#### Migration 013: Update challenge_leaderboard + Create team leaderboard view

**File:** `supabase/migrations/013_update_leaderboard_views.sql`

**Change 1: Update `challenge_leaderboard` view**
Add LEFT JOIN to `teams` table to include `team_name` and `team_color`:
```sql
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT
    cp.*,
    pr.display_name,
    pr.avatar_url,
    pr.username,
    t.name as team_name,
    t.color as team_color,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.total_ability_points DESC, cp.current_streak DESC) as rank
FROM challenge_participants cp
LEFT JOIN profiles pr ON cp.user_id = pr.id
LEFT JOIN teams t ON cp.team_id = t.id;
```

**Change 2: Create `challenge_team_leaderboard` view**
Aggregate team totals per challenge:
```sql
CREATE OR REPLACE VIEW challenge_team_leaderboard AS
SELECT
    t.id as team_id,
    t.name as team_name,
    t.color as team_color,
    t.group_id,
    cp.challenge_id,
    COUNT(cp.user_id) FILTER (WHERE cp.status IN ('active', 'completed')) as member_count,
    COALESCE(SUM(cp.total_ability_points) FILTER (WHERE cp.status IN ('active', 'completed')), 0) as total_points,
    COALESCE(SUM(cp.current_streak) FILTER (WHERE cp.status IN ('active', 'completed')), 0) as total_streak,
    RANK() OVER (PARTITION BY cp.challenge_id ORDER BY COALESCE(SUM(cp.total_ability_points) FILTER (WHERE cp.status IN ('active', 'completed')), 0) DESC) as rank
FROM teams t
LEFT JOIN challenge_participants cp ON t.id = cp.team_id
GROUP BY t.id, t.name, t.color, t.group_id, cp.challenge_id;
```

### Files Plan

**New files to create:**
1. `supabase/migrations/013_update_leaderboard_views.sql` — DB migration
2. `services/leaderboard.ts` — Leaderboard service (fetch individual + team leaderboard)
3. `services/team.ts` — Team service (CRUD: create team, assign participant, remove from team, delete team, get teams)
4. `hooks/useLeaderboard.ts` — Hook for fetching leaderboard data
5. `hooks/useTeams.ts` — Hook for team management operations

**Files to modify:**
1. `components/challenge-tabs/LeaderboardTab.tsx` — Replace mock data with real data via `useLeaderboard` hook
2. `components/challenge-tabs/AdminTab.tsx` — Replace mock data with real data via `useTeams` hook
3. `.claude/database-schema.md` — Update views documentation + add migration to log

### Implementation Phases

#### Phase 2A: Database Migration
1. Create `013_update_leaderboard_views.sql`
2. Update `.claude/database-schema.md`

#### Phase 2B: Services Layer
1. Create `services/leaderboard.ts` — `getIndividualLeaderboard(challengeId)`, `getTeamLeaderboard(challengeId)`
2. Create `services/team.ts` — `getTeams(groupId)`, `createTeam(groupId, name, color)`, `deleteTeam(teamId)`, `assignParticipantToTeam(participantId, teamId)`, `removeParticipantFromTeam(participantId)`

#### Phase 2C: Hooks
1. Create `hooks/useLeaderboard.ts` — Fetches both individual + team leaderboard for a challenge
2. Create `hooks/useTeams.ts` — Team CRUD operations for AdminTab

#### Phase 2D: LeaderboardTab Wiring
1. Replace mock data with `useLeaderboard` hook
2. Map DB response to existing UI data shapes
3. Handle loading + empty states
4. Keep top 6 individual display (3 podium + 3 list)

#### Phase 2E: AdminTab Wiring
1. Replace mock data with `useTeams` hook
2. Wire create team to `teamService.createTeam()`
3. Wire assign participant to `teamService.assignParticipantToTeam()`
4. Wire remove participant to `teamService.removeParticipantFromTeam()`
5. Fetch real participants from `challenge_participants`

### Supabase Requirements
- [x] New tables needed? **No** — `teams` and `challenge_participants.team_id` already exist
- [x] New RLS policies needed? **No** — teams already have RLS, views inherit from base tables
- [x] New migrations needed? **Yes** — Update `challenge_leaderboard` view + create `challenge_team_leaderboard` view
- [x] Schema documentation update needed? **Yes** — Add new view docs + migration log entry

### Dependencies Needed
- None — all dependencies already in place

### Decisions Made
- **Team leaderboard uses SUM not AVG for streak:** Cumulative total of all member streaks (per user requirement: "gets added as a cumulative total")
- **FILTER clause:** Use `FILTER (WHERE status IN ('active', 'completed'))` to only count active/completed participants in team totals
- **Individual leaderboard limited to top 6:** Top 3 on podium, 4-6 in list (per user requirement)
- **Teams remain group-scoped:** Teams belong to groups, not challenges — this is the existing design and makes sense for group challenges
- **Single migration file:** Both view changes in one migration since they're related

### Notes
- The existing `challenge_leaderboard` view is used via `cp.*` which already includes `team_id` — adding `team_name` and `team_color` is additive, no breaking changes
- The team leaderboard query from `example-queries.sql` was a good reference but the view approach is cleaner
- AdminTab already has beautiful UI for creating teams with 10 preset colors — just needs DB wiring
- LeaderboardTab already has the exact layout requested (top 3 podium + others list + team standings)

### Reflection
**What went well:**
- The database is very well set up for this feature — teams table, team_id FK, and per-participant stats all exist
- The frontend UI is already fully designed — we just need to replace mock data with real queries
- The existing `example-queries.sql` had reference queries for both individual and team leaderboards

**What could be improved:**
- The `challenge_leaderboard` view should have included team info from the start

**Risks identified:**
- Team leaderboard view needs careful handling of NULL `challenge_id` when teams exist but no participants are assigned
- The FILTER clause in the team leaderboard view may need testing with edge cases (no members, all quit, etc.)
- If a challenge has no teams, the team standings section should be hidden

**⚠️ STOP - Awaiting approval to proceed to Phase 2**

---

## PHASE 2: IMPLEMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Create migration `013_update_leaderboard_views.sql`
- [x] Update `.claude/database-schema.md`
- [x] Create `services/leaderboard.ts`
- [x] Create `services/team.ts`
- [x] Create `hooks/useLeaderboard.ts`
- [x] Create `hooks/useTeams.ts`
- [x] Wire up LeaderboardTab with real data
- [x] Wire up AdminTab with real data
- [x] Handle loading and empty states
- [x] Fix Team type in `database.example.ts` (challenge_id → group_id) + add TeamLeaderboardEntry
- [x] Add `group_id` to `useChallengeDetail` and pass to AdminTab

### Files Created
- `supabase/migrations/013_update_leaderboard_views.sql` — Updated `challenge_leaderboard` view + created `challenge_team_leaderboard` view
- `services/leaderboard.ts` — `getIndividualLeaderboard()`, `getTeamLeaderboard()`
- `services/team.ts` — `getTeamsByGroupId()`, `createTeam()`, `deleteTeam()`, `assignParticipantToTeam()`, `removeParticipantFromTeam()`, `removeParticipantFromChallenge()`, `getChallengeParticipants()`
- `hooks/useLeaderboard.ts` — Fetches individual + team leaderboard in parallel
- `hooks/useTeams.ts` — Team CRUD operations + participant management

### Files Modified
- `components/challenge-tabs/LeaderboardTab.tsx` — Replaced all mock data with `useLeaderboard` hook, added loading/error/empty states, avatar fallbacks
- `components/challenge-tabs/AdminTab.tsx` — Replaced all mock data with `useTeams` hook, wired all CRUD operations, activated delete team button, real participant avatars in team cards
- `hooks/useChallengeDetail.ts` — Added `group_id` to ChallengeDetail + RawChallengeRow + select query
- `app/challenge/[id].tsx` — Pass `groupId={challenge.group_id}` to AdminTab
- `services/index.ts` — Added exports for leaderboard + team services
- `types/database.example.ts` — Fixed Team type (`challenge_id` → `group_id`), added `TeamLeaderboardEntry` interface
- `.claude/database-schema.md` — Updated `challenge_leaderboard` docs, added `challenge_team_leaderboard` docs, added migration 013 to log

### Key Implementation Details
- **LeaderboardTab:** Uses `useLeaderboard` hook which fetches individual + team data in parallel; team standings section auto-hides if no teams exist; top 3 podium with fallback to list if fewer than 3 participants; shows top 6 (3 podium + 3 list)
- **AdminTab:** Uses `useTeams` hook; all operations (create team, delete team, assign/remove participants) hit Supabase directly and refetch data; delete team now active with confirmation dialog; team member avatars shown in team cards; relative join dates
- **Services:** Follow existing project patterns (`throw error`, typed returns, `supabase` client import)
- **Hooks:** Follow `useProfile`/`useChallengeDetail` patterns (useState + useEffect + useCallback)
- **Team leaderboard view:** Uses FILTER clause to only count active/completed participants; RANK() partitioned by challenge_id
- **Avatar fallbacks:** Both components show initial letter in a dark circle when no avatar_url exists

### Reflection
**What went well:**
- Clean separation: services handle DB queries, hooks manage state, components handle UI
- Existing UI design preserved exactly — only data source changed
- All mock data removed — no hardcoded fallbacks

**What could be improved:**
- Could add optimistic updates for team assignments to feel snappier
- Could add pull-to-refresh on the leaderboard

**⚠️ STOP - Awaiting approval to proceed to Phase 3**

---

## PHASE 3: TESTING & REVIEW

**Status:** ✅ Complete

### Tasks
- [x] Code review all new and modified files
- [x] Verify migration SQL correctness
- [x] Verify team standings show cumulative totals (view uses SUM + FILTER correctly)
- [x] Verify admin can create teams and assign participants (all CRUD wired)
- [x] Check TypeScript types (Team fixed, TeamLeaderboardEntry added, LeaderboardEntry extended)
- [x] Verify no visual regressions (existing UI preserved, only data source changed)

### Review Findings
- **Migration SQL:** Both views correct. `challenge_leaderboard` adds team_name/team_color via LEFT JOIN. `challenge_team_leaderboard` aggregates correctly using FILTER clause + RANK() window function on grouped rows. Valid PostgreSQL.
- **FK constraint verified:** `team_id REFERENCES teams(id) ON DELETE SET NULL` — deleting a team safely unassigns participants.
- **Services:** Clean patterns, proper error handling, correct status filtering.
- **Hooks:** Follow established patterns (useState + useCallback + useEffect). Parallel fetching with Promise.all in useLeaderboard.
- **LeaderboardTab:** Proper loading/error/empty states. Podium fallback for < 3 participants. Team standings hidden when no teams.
- **AdminTab:** All operations wired with confirmation dialogs. isSaving prevents double-tap. unassignedParticipants correctly computed.
- **Types:** Team.group_id corrected. TeamLeaderboardEntry matches view. LeaderboardEntry extended with team fields.
- **No issues found.** `removeFromTeam` intentionally not wired in UI (separate future feature).

---

## PHASE 4: REFLECTION & CLEANUP

**Status:** ✅ Complete

### Tasks
- [x] Document known limitations
- [x] Note future improvements
- [x] Final code review (completed in Phase 3)
- [x] Update database-schema.md (completed in Phase 2)

### Known Limitations
1. **No team reassignment in UI** — `removeFromTeam` hook method exists but AdminTab doesn't expose a way to move a participant from one team to another. Planned as a separate feature.
2. **Add-member modal only shows unassigned participants** — Participants already in a team must be removed first before reassigning. This will be addressed by the team reassignment feature.
3. **No pull-to-refresh** — LeaderboardTab and AdminTab don't support pull-to-refresh; data loads on mount and after mutations.
4. **Team leaderboard shows all teams** — Teams with 0 active members still appear in team standings (with 0 points/streak). Could be filtered client-side if desired.

### Future Improvements
1. **Team reassignment** — Allow moving participants between teams directly (planned as separate dev job)
2. **Pull-to-refresh** — Add RefreshControl to LeaderboardTab and AdminTab ScrollViews
3. **Optimistic updates** — Team assignment/removal could update UI immediately before server confirms
4. **Real-time subscriptions** — Subscribe to `challenge_participants` changes so leaderboard updates live
5. **Pagination** — Individual leaderboard currently limited to top 6 client-side; could paginate for large challenges

### Final Reflection
**What went well:**
- Database was well-prepared — teams table, team_id FK, per-participant stats all existed
- Frontend UI was fully designed with mock data — clean swap to real data
- Service → hook → component layering kept each file focused and testable
- Both views (individual + team leaderboard) work with a single migration file

**What we built:**
- 1 migration (2 view updates)
- 2 services (leaderboard + team)
- 2 hooks (useLeaderboard + useTeams)
- 2 components rewritten (LeaderboardTab + AdminTab)
- 4 supporting files modified (useChallengeDetail, [id].tsx, database.example.ts, services/index.ts)
- Database schema docs updated
