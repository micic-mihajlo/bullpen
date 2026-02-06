# Dashboard MVP — Build Plan

## Vision

The operator dashboard is where Mihajlo lives. It's mission control for running an AI agency.
Dark theme, monospace, dense information, keyboard-driven. Think: linear.app meets vercel dashboard.
Not flashy — functional. Every pixel earns its place.

## What Exists Now

- 3-column layout: agents (left) | tasks (center) | events (right)
- Agent list with create/status/detail
- Task board with kanban columns (pending/running/completed/failed)
- Event feed (real-time)
- Convex schema: agents, tasks, events, messages, clients, projects, deliverables
- Convex functions: CRUD for agents + tasks, events logging
- Dark theme with custom CSS vars (mc-bg, mc-accent, etc.)
- Keyboard shortcuts provider, toast system
- JetBrains Mono font throughout

## What's Missing (This PR)

### 1. Navigation & Layout (sidebar)
Current: flat single page. Need: sidebar nav with sections.

**Pages:**
- `/` — Overview (stats + recent activity)
- `/projects` — Project list + detail
- `/agents` — Agent roster (existing, enhanced)
- `/tasks` — Task board (existing, enhanced)
- `/review` — Review queue for deliverables
- `/clients` — Client list

**Sidebar:**
- Collapsible, icon + text
- Active state indicator
- Stats badges (pending reviews count, running tasks)
- 🐂 logo at top

### 2. Overview Page (new home)
The first thing you see. At-a-glance operational status.

- **Stats row**: active projects, pending tasks, agents online, pending reviews
- **Active projects**: list with progress bars, deadlines, client names
- **Recent activity**: last 10 events (compact)
- **Quick actions**: new project, new task, dispatch agent

### 3. Projects Page (new)
The core workflow page. A project = a client deliverable container.

**List view:**
- Cards showing: project name, client, status badge, task count, deadline
- Filter by status (intake/active/review/delivered)
- Sort by deadline, created, name

**Detail view (slide-out or sub-page):**
- Project header: name, client, status, deadline, brief
- Task breakdown: tasks belonging to this project
- Deliverables: list with approve/reject actions
- Timeline: events related to this project

**Create flow:**
- Client selection (existing or create new)
- Project name, type, brief (textarea)
- Deadline picker
- Auto-creates intake status

### 4. Review Queue (new)
The operator's QA station. Deliverables waiting for approval.

- List of deliverables in "review" status
- Each shows: title, project name, agent who created it, content preview
- Actions: Approve (→ delivered), Reject (→ draft + notes), View full content
- Markdown/code rendering for content preview
- Review notes textarea on reject

### 5. Enhanced Agent Roster
Existing agent list, upgraded:

- Agent cards with: model, skills, current task, last seen
- Status indicators (online/busy/offline) with time since last heartbeat
- Quick dispatch: assign pending task from agent card
- Performance: tasks completed, success rate (from events)

### 6. Enhanced Task Board
Existing kanban, upgraded:

- Drag-and-drop between columns (optional, nice-to-have)
- Task cards show: title, assigned agent, project link, priority badge, time elapsed
- Inline create from any column
- Filter by project, agent, priority
- Batch actions: select multiple, assign, delete

### 7. Client Management (new)
Simple CRUD for now:

- Client list with: name, company, plan, status, project count
- Detail: contact info, projects list, communication history
- Create/edit modal

### 8. Convex Function Additions Needed

```
projects.ts:
  - list (with filters)
  - get (with tasks + deliverables)
  - create
  - updateStatus
  - remove

deliverables.ts:
  - list (with filters)
  - byProject
  - pendingReview (for review queue)
  - approve
  - reject
  - create

clients.ts:
  - list
  - get (with projects)
  - create
  - update
  - remove

events.ts:
  - byProject (events related to a project's tasks)
  - recent (last N events, for overview)

tasks.ts (additions):
  - byProject
  - withAgent (join agent data)
```

### 9. Design Language

Carry from landing page energy but adapted for dashboard density:

- **Font**: JetBrains Mono (already set)
- **Bg**: #0a0a0a (dark, existing)
- **Accent**: blue #3b82f6 for interactive, keep semantic colors (green/yellow/red for status)
- **Cards**: subtle border, bg-secondary on hover
- **Spacing**: tight but breathable. 16px base rhythm
- **Animations**: slide-in for panels, fade for state changes. Nothing bouncy.
- **Empty states**: helpful text + action button, not just "no data"
- **Loading**: skeleton shimmer, not spinners

### 10. Keyboard Shortcuts

- `n` — new task
- `p` — new project
- `1-5` — switch pages
- `/` — search (future)
- `r` — refresh/sync
- `?` — help overlay

## File Plan

```
apps/dashboard/src/
├── app/
│   ├── layout.tsx          (add sidebar)
│   ├── page.tsx            (overview)
│   ├── projects/
│   │   └── page.tsx
│   ├── agents/
│   │   └── page.tsx
│   ├── tasks/
│   │   └── page.tsx
│   ├── review/
│   │   └── page.tsx
│   └── clients/
│       └── page.tsx
├── components/
│   ├── sidebar.tsx         (new)
│   ├── stat-card.tsx       (new)
│   ├── empty-state.tsx     (new)
│   ├── status-badge.tsx    (enhance)
│   ├── dashboard/
│   │   ├── overview.tsx    (new)
│   │   ├── project-list.tsx    (new)
│   │   ├── project-detail.tsx  (new)
│   │   ├── project-create.tsx  (new)
│   │   ├── review-queue.tsx    (new)
│   │   ├── client-list.tsx     (new)
│   │   ├── client-detail.tsx   (new)
│   │   ├── agent-list.tsx      (enhance)
│   │   ├── agent-detail.tsx    (enhance)
│   │   ├── task-board.tsx      (enhance)
│   │   ├── task-detail.tsx     (enhance)
│   │   └── event-feed.tsx      (enhance)
│   └── ui/
│       ├── modal.tsx       (new)
│       ├── dropdown.tsx    (new)
│       └── skeleton.tsx    (new)
└── convex/
    ├── projects.ts         (enhance)
    ├── deliverables.ts     (enhance)
    ├── clients.ts          (enhance)
    ├── events.ts           (enhance)
    └── tasks.ts            (enhance)
```

## Agent Assignment

### Agent 1: Claude Code (Opus 4.6) — UI/Layout
- Sidebar + navigation
- Overview page
- Projects page (list + detail + create)
- Review queue
- Client management
- All new UI components (modal, dropdown, skeleton, empty-state, stat-card)
- Design system consistency
- Responsive considerations

### Agent 2: Codex 5.3 — Backend/Data
- All Convex function additions (projects, deliverables, clients, events, tasks)
- Type safety
- Index optimization
- API route additions if needed
- Data validation

### Integration
After both agents complete, merge their work and resolve any conflicts.
Test end-to-end: create client → create project → add tasks → dispatch → review deliverable.

## Definition of Done

- [ ] Sidebar navigation works, all pages route correctly
- [ ] Overview page shows real stats from Convex
- [ ] Can create a client
- [ ] Can create a project (linked to client)
- [ ] Can create tasks within a project
- [ ] Tasks show on the task board, linked to project
- [ ] Deliverables appear in review queue
- [ ] Can approve/reject deliverables
- [ ] Event feed shows project-related events
- [ ] Empty states are helpful, not broken-looking
- [ ] Keyboard shortcuts work
- [ ] No TypeScript errors
- [ ] Consistent dark theme throughout
