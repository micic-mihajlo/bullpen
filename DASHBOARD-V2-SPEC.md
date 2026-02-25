# Dashboard V2 — Command Center Redesign

## Overview
Restructure the Bullpen dashboard from 6 CRUD pages to 3 purpose-driven views.
Branch: `feat/dashboard-v2`

## Sidebar: 6 tabs → 3
**Keep:** Command Center (/) | Projects (/projects) | Agents (/agents)
**Remove as standalone pages:** Tasks, Review, Clients
- Tasks → nested inside Projects (project detail has task list)
- Review → action queue on Command Center
- Clients → inline on project detail

## Schema Changes (convex/schema.ts)

### Tasks table — add fields:
```
taskType: v.union(
  v.literal("coding"),
  v.literal("automation"),
  v.literal("research"),
  v.literal("design"),
  v.literal("review"),
  v.literal("general")
),
liveContext: v.optional(v.any()),  // type-specific data
agentThread: v.optional(v.string()),  // chat thread reference
```

### New table: agentMessages
```
defineTable({
  taskId: v.id("tasks"),
  fromAgent: v.string(),
  toAgent: v.string(),  // agent name, "orchestrator", or "all"
  message: v.string(),
  messageType: v.union(
    v.literal("update"),
    v.literal("question"),
    v.literal("decision"),
    v.literal("handoff"),
    v.literal("steering")  // human operator input
  ),
  timestamp: v.number(),
})
.index("by_task", ["taskId", "timestamp"])
```

## Page 1: Command Center (/)

### Layout (top to bottom):
1. **Agent Status Strip** — horizontal row of agent bubbles
   - Green pulse = working, amber = idle, red = error
   - Shows agent name + current task name
   - Click → navigates to agent detail

2. **Two-column layout below:**

   **Left (60%): Active Work**
   - Task cards grouped by project
   - Each card shows: task name, type icon, assigned agent, time elapsed
   - Type-aware mini-preview:
     - coding: "3 files changed" 
     - automation: "5-node pipeline"
     - research: "12 sources found"
   - Click → full task detail view (modal or slide-over)

   **Right (40%): Action Queue + Feed**
   - **Needs Attention** (top): review items, stuck tasks, agent questions
     - Each item has approve/reject/respond actions inline
   - **Activity Feed** (bottom): live stream of events
     - Compact, one-line-per-event format

3. **Bottom strip: Business Metrics**
   - Agent utilization %, tasks completed today, avg delivery time
   - Compact, not the focus

## Page 2: Projects (/projects)

### List view:
- Project cards with: name, client, status, task count, budget bar
- Click → expand inline or navigate to detail

### Detail view (/projects/[id]):
- Project header: name, client info, status, budget/timeline
- **Tasks tab** (default): task list with type icons, status, assignee
  - Click task → opens task detail (slide-over panel)
- **Deliverables tab**: submitted work, approval status
- **Activity tab**: project-specific event feed

## Page 3: Agents (/agents)

### Grid of agent cards:
- Agent name, status indicator, current task
- Utilization bar (% busy in last 24h)
- Click → agent detail

### Agent detail:
- Current task with live preview
- Task history
- Chat thread (all messages this agent has sent/received)

## Task Detail View (slide-over panel, not a page)

### Header:
- Task name, type badge, status, assigned agent, time

### Body — type-aware:
- **coding**: file list, recent changes summary, preview link
- **automation**: pipeline visualization (reuse ClawSync component style)
- **research**: search log, sources list, draft output
- **design**: screenshot/preview, revision count
- **general**: description + output

### Chat Thread (bottom of panel):
- Messages between agents and orchestrator
- Input field for operator to send steering messages
- Auto-scrolls, shows timestamps

## Design System
Keep existing "Warm Professional" tokens:
- Background: #faf9f6
- Cards: #ffffff
- Borders: #e8e5de
- Accent: #c2410c (burnt orange)
- Fonts: Inter (sans), JetBrains Mono (mono)

## Implementation Order
1. Schema migration (add taskType, agentMessages table, update tasks)
2. Sidebar update (3 items)
3. Command Center page
4. Project detail with inline tasks
5. Task detail slide-over panel
6. Agent chat thread (backend + UI)
7. Polish + test

## Constraints
- Build must pass (tsc --noEmit + pnpm run build)
- Don't touch apps/landing/
- Keep existing Convex queries/mutations backward-compatible where possible
- Default taskType to "general" for existing tasks
