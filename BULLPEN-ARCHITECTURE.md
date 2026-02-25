# Bullpen Architecture — The Real System

## How Bullpen Actually Works

Bullpen is an AI-native software agency. One orchestrator agent (The Clawdfather) manages everything. Sub-agents are real OpenClaw instances with pre-configured skills, tools, and personalities — not chatbot wrappers or fake team members.

---

## The Flow

```
Client → Project (description, requirements)
    ↓
Orchestrator decomposes Project → Tasks (with steps)
    ↓
Orchestrator picks worker type for each Task
    ↓
Orchestrator spawns OpenClaw sub-agent (sessions_spawn)
    ↓
Sub-agent works through steps using real tools + skills
    ↓
Orchestrator reviews each step (approve / steer / reject)
    ↓
Task complete → Orchestrator reviews output
    ↓
All tasks done → Orchestrator compiles deliverables
    ↓
Client reviews in Glass Box dashboard
```

---

## Roles

### Orchestrator (The Clawdfather)
- The only persistent agent
- Runs on Claude Opus 4.6
- Has access to ALL tools and skills
- Responsibilities:
  - Decompose projects into tasks with clear steps
  - Select and spawn the right worker(s) for each task
  - Review every meaningful step before worker continues
  - Steer workers when they go off-track
  - Compile final deliverables from completed tasks
  - Communicate with humans (team + clients)
- Think: strict but knowledgeable engineering manager

### Workers (Sub-agents)
- Spawned on-demand via `sessions_spawn`
- Each is a real OpenClaw sub-agent with:
  - SOUL.md (personality, role, communication style)
  - SKILL.md files (pre-loaded, role-specific)
  - Tool access (exec, browser, web_fetch, etc.)
  - Model assignment (sonnet for throughput, opus for complex reasoning)
- Workers are ephemeral — they exist for the duration of a task
- Multiple workers of the same type can run in parallel
- Workers report progress through agent messages
- Workers DO NOT self-review — orchestrator reviews their output

---

## Worker Types

### Frontend Builder
- **Role:** Build React/Next.js components, pages, styling
- **Model:** Claude Sonnet 4
- **Tools:** exec, browser, web_fetch
- **Skills:**
  - frontend-design/SKILL.md (design quality, no AI slop)
  - coding-agent/SKILL.md (Claude Code / Codex operation)
- **Review frequency:** Every 3 steps
- **Spawns as:** Multiple if project has many pages/components

### Backend Engineer
- **Role:** APIs, database schemas, server logic, integrations
- **Model:** Claude Sonnet 4
- **Tools:** exec, web_fetch
- **Skills:**
  - convex-skill/SKILL.md (Convex-specific patterns)
  - coding-agent/SKILL.md
- **Review frequency:** Every 2 steps
- **Spawns as:** Usually single, may pair with Frontend Builder

### Automation Builder
- **Role:** n8n workflows, integrations, webhooks, scheduled jobs
- **Model:** Claude Sonnet 4
- **Tools:** exec, web_fetch
- **Skills:**
  - n8n-workflow-patterns/SKILL.md
  - n8n-code-javascript/SKILL.md
  - n8n-node-configuration/SKILL.md
  - n8n-validation-expert/SKILL.md
  - n8n-expression-syntax/SKILL.md
- **Review frequency:** Every 2 steps
- **Spawns as:** Single per automation task

### Research Analyst
- **Role:** Market research, competitor analysis, technical research, data gathering
- **Model:** Claude Opus 4.6 (needs deep reasoning)
- **Tools:** web_fetch, web_search (Tavily), browser
- **Skills:**
  - Research methodology (to be created)
- **Review frequency:** Every 5 steps (more autonomous)
- **Spawns as:** Multiple for parallel research tracks

### Design Reviewer
- **Role:** Review UI/UX output, suggest improvements, check accessibility
- **Model:** Claude Opus 4.6 (needs taste/judgment)
- **Tools:** browser (screenshots), web_fetch
- **Skills:**
  - frontend-design/SKILL.md (same design principles)
- **Review frequency:** Every review is a step
- **Spawns as:** Single, runs after Frontend Builder completes

### QA Tester
- **Role:** Test built software, find bugs, verify requirements
- **Model:** Claude Sonnet 4
- **Tools:** exec, browser
- **Skills:**
  - coding-agent/SKILL.md
  - Testing patterns (to be created)
- **Review frequency:** Every 3 steps
- **Spawns as:** After coding tasks complete

---

## Schema Design

### Projects (existing, enhanced)
```
projects: {
  name: string,
  description: string,
  clientId: Id<"clients">,
  status: "intake" | "planning" | "active" | "review" | "delivered" | "archived",
  budget: number (optional),
  deadline: number (optional),
  createdAt: number,
  updatedAt: number,
}
```

### Tasks (enhanced)
```
tasks: {
  projectId: Id<"projects">,
  title: string,
  description: string,
  taskType: "coding" | "automation" | "research" | "design" | "review" | "general",
  status: "pending" | "assigned" | "running" | "review" | "completed" | "failed",
  
  // Worker assignment
  workerType: string,           // which worker template to use
  workerId: Id<"workers"> | null, // active worker instance
  
  // Step tracking
  steps: [{
    name: string,
    description: string,
    status: "pending" | "in_progress" | "review" | "approved" | "rejected",
    agentOutput: string | null,  // what the worker produced
    reviewNote: string | null,   // orchestrator's review comment
    startedAt: number | null,
    completedAt: number | null,
  }],
  currentStep: number,          // index of current step
  
  // Context
  liveContext: any,             // type-specific data (files, pipeline, sources)
  agentThread: string | null,  // chat thread reference
  
  // Timing
  createdAt: number,
  startedAt: number | null,
  completedAt: number | null,
  
  // Dependencies
  dependsOn: Id<"tasks">[] | null,  // tasks that must complete first
  priority: "low" | "medium" | "high" | "urgent",
}
```

### Workers (new — runtime instances)
```
workers: {
  templateName: string,         // "frontend-builder", "backend-engineer", etc.
  taskId: Id<"tasks">,
  sessionKey: string,           // OpenClaw session key
  status: "spawning" | "active" | "paused" | "completed" | "failed",
  model: string,
  spawnedAt: number,
  lastActivityAt: number,
  completedAt: number | null,
}
.index("by_task", ["taskId"])
.index("by_status", ["status"])
```

### Agent Messages (existing, enhanced)
```
agentMessages: {
  taskId: Id<"tasks">,
  fromAgent: string,            // "orchestrator", worker template name, or "client"
  toAgent: string,              // "orchestrator", "all", or specific worker
  message: string,
  messageType: "update" | "question" | "decision" | "handoff" | "steering" | "step_review",
  stepIndex: number | null,     // which step this relates to
  timestamp: number,
}
.index("by_task", ["taskId", "timestamp"])
```

### Worker Templates (new — replaces agents table)
```
workerTemplates: {
  name: string,                 // "frontend-builder"
  displayName: string,          // "Frontend Builder"
  role: string,                 // human-readable role description
  taskTypes: string[],          // which task types this template handles
  model: string,                // "claude-sonnet-4", "claude-opus-4-6"
  tools: string[],              // ["exec", "browser", "web_fetch"]
  skills: string[],             // skill file paths
  systemPrompt: string,         // the SOUL
  reviewEvery: number,          // steps between required reviews
  maxParallel: number,          // how many can run simultaneously
  status: "active" | "draft",
}
```

---

## Dashboard UX

### Command Center (/)
What the orchestrator (me) sees:
- **My Queue:** Tasks waiting for decomposition or step review
- **Active Workers:** Currently running sub-agents with progress
- **Step Reviews:** Steps awaiting my approval (the main action item)
- **Activity Feed:** Real-time log of agent actions

### Projects (/projects)
- Project list with status, task count, budget
- Project detail: task breakdown with step progress bars
- Client info inline
- Deliverables tab

### Workers (/workers — replaces /agents)
- **Template Gallery:** Available worker types with their skills listed
- **Active Workers:** Currently spawned instances, what they're doing
- **Spawn controls:** Button to manually spawn a worker for a task

### Task Detail (slide-over)
- Type-aware live view (coding/automation/research/design)
- **Step timeline:** Visual progress through steps with review status
- **Agent chat:** Messages between orchestrator and worker
- **Step review controls:** Approve / Steer / Reject buttons per step

---

## Orchestration Mechanics

### Project Decomposition
When a project comes in, I:
1. Read the full description and requirements
2. Break it into tasks with clear boundaries
3. Define steps for each task (3-8 steps typical)
4. Set dependencies between tasks (e.g., "backend API before frontend integration")
5. Assign priority ordering
6. Pick worker types for each task

### Spawning Workers
For each task ready to start:
1. Check dependencies are met
2. Select worker template based on taskType
3. Call `sessions_spawn` with:
   - Task context (description, steps, project info)
   - Worker's SOUL.md content
   - Instruction to report after each step
4. Record the session in workers table
5. Monitor via `sessions_history` / `sessions_send`

### Step Review Loop
The core operating loop:
```
Worker completes step
    → Posts "step complete" message with output
    → Task status → "review"
    → I review the output
    → If good: approve step, worker continues to next
    → If off-track: send steering message with corrections
    → If bad: reject step, worker retries with guidance
    → If task complete: mark done, compile output
```

### Steering
When I see a worker going wrong:
- `sessions_send` with specific guidance
- Can reference the step, show what's wrong, give the fix
- Worker acknowledges and adjusts
- This is logged in agentMessages as "steering" type

### Parallel Execution
Multiple workers can run simultaneously:
- Frontend + Backend builders working on different parts
- Research analyst gathering data while coders set up structure  
- QA tester checking completed work while new work starts

I manage the coordination — workers don't talk to each other directly (yet). I'm the hub.

---

## Worker Skill Files Location

```
bullpen/
├── workers/
│   ├── frontend-builder/
│   │   ├── SOUL.md
│   │   └── skills/ (symlinks to existing skills)
│   ├── backend-engineer/
│   │   ├── SOUL.md
│   │   └── skills/
│   ├── automation-builder/
│   │   ├── SOUL.md
│   │   └── skills/
│   ├── researcher/
│   │   ├── SOUL.md
│   │   └── skills/
│   ├── design-reviewer/
│   │   ├── SOUL.md
│   │   └── skills/
│   └── qa-tester/
│       ├── SOUL.md
│       └── skills/
```

Skills are symlinked from:
- `~/.openclaw/skills/` (installed skills like frontend-design, n8n-*)
- `~/openclaw/skills/` (built-in skills like coding-agent, github)

---

## Implementation Priority

### Phase 1: Foundation (now)
- [ ] Create worker config directories with SOUL.md files
- [ ] Write/symlink skill files for each worker type
- [ ] Update schema: tasks (steps, workerType), workers table, workerTemplates table
- [ ] Sidebar: rename Agents → Workers

### Phase 2: Orchestration Pipeline
- [ ] Build spawn mechanism (workerTemplate → sessions_spawn)
- [ ] Build step review UI (approve/steer/reject per step)
- [ ] Build steering mechanism (sessions_send from dashboard)
- [ ] Agent message flow for step completions

### Phase 3: Dashboard Polish
- [ ] Command Center: step review queue as primary action
- [ ] Workers page: template gallery + active instances
- [ ] Task detail: step timeline with review controls
- [ ] Project detail: task progress with step-level visibility

### Phase 4: Glass Box (Client View)
- [ ] Read-only project dashboard for clients
- [ ] Cleaned-up activity feed (no internal chatter)
- [ ] Cost tracking visible to client
- [ ] Deliverable download/preview

---

## Orchestrator Review Process

When a worker reports a step complete, the orchestrator doesn't just rubber-stamp it. The review process:

1. **Receive step output** via webhook
2. **Evaluate against step requirements:**
   - Does the output match what the step description asked for?
   - Is it complete or partial?
   - Any obvious quality issues or red flags?
   - Does it break anything from previous steps?
3. **Decision:**
   - **Approve** — output meets requirements, move to next step
   - **Approve with note** — acceptable but flag something for later
   - **Reject with guidance** — specific instructions on what to fix and how
   - **Escalate** — flag for human review if unsure
4. **What makes a step "done":**
   - Worker reports completion with output evidence
   - Orchestrator verifies output matches step requirements
   - For coding steps: code exists, builds, no obvious errors
   - For research steps: sources cited, claims supported
   - For review steps: checklist items addressed

## Deliverable Format

Deliverables are NOT raw step outputs concatenated. They are compiled, formatted documents ready for client review.

### Structure:
```
# Project Deliverable: [Project Name]

## Executive Summary
Brief overview of what was built, key decisions, and current status.

## What Was Built
Organized by feature/component, not by internal task structure.
Links to live preview, repo, deployed URL where applicable.

## Technical Details
Architecture decisions, tech stack used, any notable patterns.

## Testing & Quality
What was tested, test results, known limitations.

## Next Steps
Recommendations, maintenance notes, future improvements.

## Artifacts
- Repository: [link]
- Live preview: [link]  
- Documentation: [link]
```

### Human Review Actions:
- **Approve** — deliverable is sent to client as-is
- **Approve with edits** — reviewer makes changes, then sends
- **Request changes** — send back to orchestrator with specific feedback
- **Add notes** — attach internal notes before sending

## Agent Skills Format

Skills must be loadable by OpenClaw sub-agents. Two approaches:

### Approach A: Injected via task prompt (current)
The worker's SOUL.md and relevant skill content is included in the sessions_spawn task message. Simple but limited context window.

### Approach B: Workspace skills (preferred, future)
Sub-agents are spawned with a workspace that has the skill files pre-loaded. The agent's AGENTS.md references the skills, and it reads them as needed. Requires sub-agent workspace setup.

### Skill file requirements:
- SKILL.md with clear instructions, examples, and constraints
- Referenced tools/scripts must be accessible to the sub-agent
- Skills should be self-contained (no dependencies on other skills)

## Open Questions
- Do workers need persistent memory between tasks, or fresh each time?
- Should workers be able to request help from other worker types?
- How do we handle worker failures? Auto-retry? Escalate to orchestrator?
- Client communication: through the dashboard chat, or separate channel?
- Billing: per-project fixed, per-step, or per-compute-hour?

---

*This document is the source of truth for how Bullpen works. Update it as the architecture evolves.*
