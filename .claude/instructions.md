# Project Development Instructions

## CRITICAL: Read These Files Every Time

**BEFORE STARTING ANY WORK:**
1. **ALWAYS** read `.claude/instructions.md` (this file)
2. **ALWAYS** read `.claude/tasks/current-task.md` to check progress
3. **ALWAYS** read `.claude/supabase-coding-standards.md` when working with Supabase
4. **ALWAYS** read `.claude/database-schema.md` when working with database
5. **ALWAYS** read `.claude/frontend-coding-standards.md` when working with components/screens

**NEVER** proceed to the next phase without explicit human approval.

**ALWAYS** confirm you have read and understood the above files before continuing.

---

## Task Management Workflow

### Starting a New Task
When beginning a new feature/component:

1. **Create new task file:**
   - Copy template from `.claude/tasks/task-template.md` to `.claude/tasks/current-task.md`
   - Fill in the Overview section
   - Begin Phase 1: Planning

2. **Announce what you're reading:**
   ```
   I've read:
   - .claude/instructions.md
   - .claude/tasks/current-task.md
   - Current status: [Phase X - Y% complete]
   ```

### During Development

1. **Update current-task.md frequently:**
   - Mark tasks with ✓ as you complete them
   - Update "Currently working on" section
   - Note blockers immediately
   - Update Last Updated timestamp

2. **Stop at phase boundaries:**
   - Complete all tasks in current phase
   - Fill in Reflection section
   - Mark phase status as Complete
   - **STOP and wait for approval**

3. **Status indicators:**
   - ⏸️ Not Started
   - 🔄 In Progress (actively working)
   - ✅ Complete (all tasks done)
   - ⏭️ Skipped (if phase not needed)

### Completing a Task

1. Move `current-task.md` to `completed/[date]-[feature-name].md`
2. Example: `completed/2026-02-15-challenge-creation.md`
3. Clear `current-task.md` for next task

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

### Before Committing Code
- [ ] All phase tasks checked off
- [ ] No console errors
- [ ] Tested core functionality on device/simulator
- [ ] Updated current-task.md
- [ ] Reflection completed

---

## Phase Checkpoint Protocol

**At the end of EVERY phase:**

1. Mark all tasks in phase as complete
2. Fill in Reflection section (what went well, improvements)
3. Update phase status to Complete
4. Update "Last Updated" timestamp
5. **STOP - Do not proceed**
6. Say: "Phase [X] complete. Awaiting approval to proceed to Phase [Y]."

**DO NOT:**
- Continue to next phase automatically
- Skip reflection sections
- Leave tasks unchecked
- Forget to update timestamps

---

## Communication Standards

### Starting Each Session
```
I've read the following files:
- .claude/instructions.md ✓
- .claude/tasks/current-task.md ✓

Current Status:
- Task: [Task name]
- Phase: [Phase number and name]
- Progress: [X/Y tasks complete]
- Next: [What I'll work on]

Ready to proceed?
```

### Ending Each Session
```
Session Summary:
✓ Completed: [list tasks]
📝 Updated: current-task.md with progress
⏸️ Status: [Phase X - Y% complete]

Next Steps:
- [What remains in current phase]

[If phase complete:]
🛑 Phase [X] complete - awaiting approval to proceed to Phase [Y]
```

### When Blocked
```
⚠️ BLOCKER ENCOUNTERED

Issue: [Description]
Attempted: [What I tried]
Suggestions: [Possible solutions]
Impact: [What's blocked]

Documented in current-task.md - awaiting guidance.
```

---

## Self-Review Checklist

After **each phase**, verify:

- [ ] All tasks marked complete (✓)
- [ ] Reflection section filled out
- [ ] Timestamp updated
- [ ] Phase status updated
- [ ] Notes captured
- [ ] No work started on next phase

After **implementation phase specifically:**

- [ ] Code follows project patterns
- [ ] NativeWind/Tailwind classes used for styling
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] TypeScript types defined
- [ ] No console.log statements left
- [ ] Supabase queries use proper error handling

---

## Phase-Specific Guidelines

### Phase 1: Planning
- Break down requirements into specific tasks
- Identify all components needed
- Note any Supabase/API dependencies
- Flag potential complexity/risks
- Get approval before coding

### Phase 2: Implementation
- Work through tasks sequentially
- Update "Currently working on" frequently
- Commit working code regularly
- Document decisions as you make them
- Stop if blocked - don't guess

### Phase 3: Testing & Review
- Test systematically (happy path, errors, edge cases)
- Verify on iOS and Android (if applicable)
- Document all issues found
- Don't fix issues yet - just document

### Phase 4: Reflection
- Be honest about what worked/didn't
- Identify technical debt created
- Note future improvements
- Document lessons learned
- Think about reusability

---

## Database Change Protocol

### When Creating or Modifying Supabase Schema

**MANDATORY STEPS (in this order):**

1. **Write the SQL migration**
   - Create file in `supabase/migrations/` with numbered prefix
   - Example: `supabase/migrations/002_add_comments_table.sql`

2. **Write the migration SQL**
   - Add tables, columns, indexes, RLS policies
   - Include rollback comments where applicable

3. **IMMEDIATELY update `.claude/database-schema.md`**
   - Add new table documentation
   - Update relationships section
   - Update ERD diagram if structure changed

4. **Announce the update**
   ```
   ✅ Migration created: 002_add_comments_table.sql
   ✅ Updated: .claude/database-schema.md (added Comments table)
   ```

5. **Mark task complete** (only after documentation is updated)

---

**NEVER:**
- Create a migration without updating database-schema.md
- Mark a task complete if schema docs are outdated
- Say "documentation will be updated later"

**The rule is:** Migration SQL + Schema documentation = ONE atomic task.

---

## File Management

### Task Files
- **Active:** `.claude/tasks/current-task.md`
- **Archive:** `.claude/tasks/completed/YYYY-MM-DD-task-name.md`

### When to Archive
- Task fully complete and approved
- Moving to completely new feature
- Major milestone reached

### Naming Convention
```
completed/2026-02-15-challenge-creation.md
completed/2026-02-16-settings-screen.md
completed/2026-02-20-notification-system.md
```

---

## Quick Commands for Human

**To start new task:**
```
"Create new task file for [feature name] and start Phase 1"
```

**To continue work:**
```
"Continue with current task - read current-task.md first"
```

**To approve phase:**
```
"Phase [X] approved - proceed to Phase [Y]"
```

**To check status:**
```
"What's the current status? Read current-task.md"
```

**To archive completed task:**
```
"Archive current task to completed folder"
```
