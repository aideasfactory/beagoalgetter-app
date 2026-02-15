# Claude Workflow System - Goal Getter

## Project Overview

**Goal Getter** is a React Native / Expo mobile application for creating and participating in social challenges and goals.

**Tech Stack:**
- React Native 0.79 + Expo 53
- TypeScript (strict mode)
- NativeWind 4 (Tailwind CSS)
- Expo Router 5 (file-based navigation)
- Supabase (auth, database, storage, real-time)
- React Hook Form + Zod (forms & validation)
- Superwall (monetization/paywalls)

---

## Folder Structure

```
.claude/
├── README.md                        # This file - system documentation
├── instructions.md                  # Main workflow rules (READ EVERY TIME)
├── supabase-coding-standards.md     # Supabase query patterns, RLS, storage
├── frontend-coding-standards.md     # React Native/Expo component standards
├── database-schema.md               # Complete Supabase schema documentation
├── settings.local.json              # Local permissions config
└── tasks/
    ├── task-template.md             # Template for new tasks
    ├── current-task.md              # Current work in progress
    └── completed/                   # Archived completed tasks
```

---

## How It Works

### 1. Before Every Task
Read these files in order:
1. `.claude/instructions.md` - Workflow rules
2. `.claude/tasks/current-task.md` - Current progress
3. Context-specific files as needed

### 2. Task Lifecycle
1. **Create task** - Copy `task-template.md` to `current-task.md`
2. **Phase 1: Planning** - Break down requirements, get approval
3. **Phase 2: Implementation** - Build the feature
4. **Phase 3: Testing** - Test and document issues
5. **Phase 4: Reflection** - Document lessons learned
6. **Archive** - Move to `completed/` folder

### 3. Phase Boundaries
**STOP at every phase boundary** and wait for human approval before proceeding.

### 4. Database Changes
Any Supabase schema changes MUST be accompanied by an update to `database-schema.md`.

---

## Key Files Reference

| File | Purpose | When to Read |
|------|---------|-------------|
| `CLAUDE.md` (project root) | Entry point, file map | Always |
| `instructions.md` | Workflow rules | Always |
| `supabase-coding-standards.md` | Supabase patterns | Backend/data work |
| `frontend-coding-standards.md` | React Native patterns | UI/component work |
| `database-schema.md` | Schema reference | Database work |
| `tasks/task-template.md` | New task template | Starting new tasks |
| `tasks/current-task.md` | Active task tracker | Always |

---

## Quick Start

```
1. Read instructions.md
2. Read current-task.md
3. Announce what you've read
4. Start working (or create new task from template)
5. Stop at phase boundaries
6. Update current-task.md as you work
```
