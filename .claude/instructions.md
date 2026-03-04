# Project Development Instructions

## CRITICAL: Read These Files Every Session

**AT THE START OF EVERY SESSION:**
1. Read `.claude/instructions.md` (this file)
2. Read `.claude/tasks/current-task.md`
3. Read context-specific files if relevant to the current phase

Then announce:
```
I've read:
- .claude/instructions.md ✓
- .claude/tasks/current-task.md ✓
- [any context-specific files] ✓

Current status: [Phase X of Y — brief description]
I understand I must not run linting or formatting commands.
```

---

## Autonomous Phase Execution Protocol

### CRITICAL: Do NOT Stop Between Phases

**You MUST execute all phases autonomously without stopping, pausing, or asking for permission between phases.** Phases exist to organize work, NOT to create pause points. Complete the entire task in one continuous execution.

### Starting a New Task

When you receive a new task:

1. **Read all required files** (instructions, current-task, context-specific)
2. **Create `.claude/tasks/current-task.md`** using the template from `.claude/tasks/task-template.md`
3. **Break the task into discrete phases** — each phase should be a self-contained unit of work
4. **Execute Phase 1 (Planning):**
   - Analyze requirements
   - Review relevant existing code
   - Identify all files to create/modify
   - Plan data structures and Supabase changes
   - Define specific, actionable tasks for each subsequent phase
   - Document decisions and risks
5. **Mark Phase 1 as complete** in current-task.md
6. **Immediately proceed to Phase 2** — do NOT write a sentinel, do NOT stop, do NOT ask to continue
7. **Continue executing all remaining phases** sequentially until the task is fully complete
8. **Write `.phase_done` sentinel file** only after the FINAL phase is complete

### Executing a Phase

For each phase (executed as part of the continuous flow):

1. **Update the phase status** to "🔄 In Progress"
2. **Execute all tasks in the phase**
3. **Update `current-task.md` as you work:**
   - Check off steps as you complete them
   - Update "Currently working on" section
   - Document any decisions or issues
4. **When the phase is complete:**
   - Mark all tasks in the phase as done
   - Update the phase status to "✅ Complete"
   - Fill in the Reflection section
   - Update the "Last Updated" timestamp
5. **Move to the next phase immediately** — no stopping, no asking

### Sentinel File

Write `.phase_done` to the **project root** only ONCE — after the **final phase** is complete.

**On success:**
```json
{
  "phase_completed": 4,
  "total_phases": 4,
  "status": "success",
  "summary": "Brief description of what was accomplished across all phases"
}
```

**On failure (if blocked mid-task):**
```json
{
  "phase_completed": 2,
  "total_phases": 4,
  "status": "failed",
  "error": "Description of what went wrong and what was tried"
}
```

Only stop on failure if genuinely blocked (e.g., missing information from the user, external dependency unavailable).

### Resumption Rules

- **Do not re-do completed phases** — pick up where you left off
- **Do not re-plan** — the plan was established in Phase 1
- **Do not modify completed phases** — only work on the current phase
- **If the plan needs adjustment** — note it in the current phase's notes and adapt
- **Execute all remaining phases** — do not stop after just one

---

## Development Standards

### Code Quality
- Follow existing project patterns
- Keep components small and focused
- Write self-documenting code
- Comment only complex logic
- Use TypeScript types for all props and state

### File Organization
- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts` (camelCase with `use` prefix)
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`
- Types: `PascalCase` in `/types/` directory
- Follow existing folder structure

---

## Phase-Specific Guidelines

### Phase 1: Planning
- Break down requirements into specific, actionable tasks
- Identify all components, services, and hooks needed
- Note any Supabase/API dependencies
- Flag potential complexity or risks
- Define the scope and tasks for each subsequent phase
- Each phase's tasks should be clear enough to execute without ambiguity

### Implementation Phases
- Work through tasks sequentially within the phase
- Update current-task.md as you work
- Document decisions as you make them
- If blocked, document the blocker and write a failed sentinel
- **Do NOT create a "Testing & Review" phase** — there is no test runner or migration runner in this workflow. Self-review happens inline via the Self-Review Checklist before marking each implementation phase complete.

### Final Phase (Reflection & Cleanup)
- Be honest about what worked and what didn't
- Identify technical debt created
- Note future improvements
- Document lessons learned
- Fill in the TASK COMPLETE section of current-task.md

---

## Database Change Protocol

### When Creating or Modifying Supabase Schema

**MANDATORY STEPS (in this order):**

1. **Write the SQL migration** in `supabase/migrations/`
2. **IMMEDIATELY update `.claude/database-schema.md`**
   - Add new table/view documentation
   - Update relationships section
   - Update ERD diagram if structure changed
3. **Both MUST be complete before writing the sentinel file**

**NEVER:**
- Create a migration without updating database-schema.md
- Write a sentinel file if schema docs are outdated

Migration SQL + Schema documentation = ONE atomic task.

---

## Self-Review Checklist

Before marking an implementation phase as complete:

- [ ] All phase tasks checked off
- [ ] Code follows project patterns
- [ ] NativeWind/Tailwind classes used for styling
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] TypeScript types defined
- [ ] No console.log statements left
- [ ] Supabase queries use proper error handling
- [ ] current-task.md updated with progress
- [ ] Reflection section filled out

---

## File Management

### Task Files
- **Active:** `.claude/tasks/current-task.md`
- **Template:** `.claude/tasks/task-template.md`
- **Archive:** `.claude/tasks/completed/YYYY-MM-DD-task-name.md`

### When to Archive
- Task fully complete (all phases done)
- Moving to completely new feature

### Naming Convention
```
completed/2026-02-15-challenge-creation.md
completed/2026-02-16-settings-screen.md
```

---

## Quick Commands

**Start new task:**
"Create new task for [feature name]"

**Resume interrupted task:**
"Continue" or "Next phase" (only needed if a previous run was interrupted or failed)

**Check status:**
"What's the current status?"

**Archive completed task:**
"Archive current task"
