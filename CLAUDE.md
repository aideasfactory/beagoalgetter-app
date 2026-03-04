# Project Instructions for Claude

## Project: Goal Getter
**Type:** React Native / Expo mobile application (iOS/Android)
**Stack:** React Native 0.79, Expo 53, TypeScript, NativeWind/Tailwind, Supabase

---

## CRITICAL: Read Before Every Session

**At the START of every session, read:**

1. **`.claude/instructions.md`** — Workflow rules and coding standards
2. **`.claude/tasks/current-task.md`** — Current task phases and progress

**Context-Specific (read when relevant to the current phase):**

3. **`.claude/supabase-coding-standards.md`** — Supabase queries, RLS, backend logic
4. **`.claude/database-schema.md`** — Database models, queries, schema changes
5. **`.claude/frontend-coding-standards.md`** — React Native components and screens

Then announce what you've read and the current status.

---

## Core Workflow: Autonomous Phase Execution

**Every task follows strict phase-based execution. Execute ALL phases autonomously — do NOT stop between phases or ask for permission to continue.**

### New Task
1. Read all required files
2. Create/update `.claude/tasks/current-task.md` — break the task into discrete phases
3. Planning IS Phase 1 — execute it fully
4. **Immediately proceed to Phase 2** — do not stop, do not ask to continue
5. Continue executing all phases sequentially until the entire task is complete
6. Write `.phase_done` sentinel to project root only after the FINAL phase

### Resuming (when told "continue" or "next phase")
1. Read `.claude/tasks/current-task.md`
2. Find the next incomplete phase
3. Execute that phase and all remaining phases sequentially
4. Write `.phase_done` sentinel after the FINAL phase

### Sentinel File (`.phase_done`)

Written only once at the end of the entire task (not after each phase):

On success:
```json
{
  "phase_completed": 4,
  "total_phases": 4,
  "status": "success",
  "summary": "Brief description of what was accomplished across all phases"
}
```

On failure:
```json
{
  "phase_completed": 2,
  "total_phases": 4,
  "status": "failed",
  "error": "What went wrong and what was tried"
}
```

See `.claude/instructions.md` for detailed rules.

---

## Forbidden Commands

**NEVER run:**
- `npm run lint` / `prettier` / `eslint` (user handles formatting)
- `npx expo start` (user manages the dev server)

---

## Database Documentation Rule

After creating or modifying ANY Supabase migration:
1. **IMMEDIATELY update `.claude/database-schema.md`**
2. Update relationships and ERD if structure changed
3. **Do this BEFORE writing the sentinel file**

---

## Quick Reference

| File | Read When |
|------|-----------|
| `instructions.md` | **Every session** |
| `tasks/current-task.md` | **Every session** |
| `supabase-coding-standards.md` | Supabase queries, RLS policies, auth, storage |
| `database-schema.md` | Schema changes, queries, relationships |
| `frontend-coding-standards.md` | React Native components, screens, navigation |
