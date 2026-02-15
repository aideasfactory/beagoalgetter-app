# Project Instructions for Claude

## Project: Goal Getter
**Type:** React Native / Expo mobile application (iOS/Android)
**Stack:** React Native 0.79, Expo 53, TypeScript, NativeWind/Tailwind, Supabase

---

## CRITICAL: Read These Files Before Every Task

**BEFORE starting ANY work, you MUST read these files:**

1. **`.claude/instructions.md`** - Main workflow rules and coding standards
2. **`.claude/tasks/current-task.md`** - Current task progress

**Context-Specific Files (read when applicable):**

3. **`.claude/supabase-coding-standards.md`** - When working with Supabase queries, RLS, or backend logic
4. **`.claude/database-schema.md`** - When working with database models, queries, or schema changes
5. **`.claude/frontend-coding-standards.md`** - When working with React Native components and screens

---

## After Reading, Always Announce:

```
I've read:
- .claude/instructions.md ✓
- .claude/tasks/current-task.md ✓

Context-specific files (if applicable):
- .claude/supabase-coding-standards.md ✓ (if Supabase work)
- .claude/database-schema.md ✓ (if database work)
- .claude/frontend-coding-standards.md ✓ (if component/screen work)

Current status: [describe current phase and progress]
```

**These instructions apply to EVERY message, EVERY session, EVERY task.**

---

## Workflow Rules (Non-Negotiable)

- **NEVER** proceed to next phase without explicit approval
- **ALWAYS** update `.claude/tasks/current-task.md` after completing tasks
- **ALWAYS** stop at phase boundaries
- **ALWAYS** use the task template from `.claude/tasks/task-template.md` when creating new tasks

---

## Forbidden Commands

**NEVER run these commands:**
- ❌ `npm run lint` (user handles linting)
- ❌ `prettier`, `eslint` (user handles formatting)
- ❌ `npx expo start` (user manages the dev server)

**Always acknowledge:** "I understand I must not run linting or formatting commands."

---

## Database Documentation Rule

**CRITICAL: After creating or modifying ANY Supabase migration or schema change:**

1. **IMMEDIATELY update `.claude/database-schema.md`**
2. Add/update the relevant table documentation
3. Update relationships if they changed
4. Update the ERD diagram if structure changed
5. **Announce:** "I've updated database-schema.md to reflect the schema changes."

**This applies to:**
- New SQL migrations in `supabase/migrations/`
- Modified tables (added/changed columns, indexes, RLS policies)
- Dropped tables or columns
- New or modified views, functions, or triggers

**Always update database-schema.md BEFORE marking the task complete.**

---

## Quick Reference

### When to Read Each File:

| File | Read When |
|------|-----------|
| `instructions.md` | **Every time** |
| `tasks/current-task.md` | **Every time** |
| `supabase-coding-standards.md` | Supabase queries, RLS policies, auth, storage |
| `database-schema.md` | Schema changes, queries, relationships |
| `frontend-coding-standards.md` | React Native components, screens, navigation |

---

## Verification

Before starting work, confirm:
- [ ] Read `instructions.md`
- [ ] Read `tasks/current-task.md`
- [ ] Read applicable context-specific files
- [ ] Understood workflow rules
- [ ] Acknowledged forbidden commands

**Then announce what you've read and proceed!**
