# Bullpen Agent System Redesign

## 1. What IS a Bullpen Agent?

A Bullpen Agent is a **specialized AI worker** with identity, capabilities, and memory. Not just a name and emoji — a real worker profile.

### Conceptual Model

```
Agent = Identity + Capabilities + Soul + Model Config + Performance
```

- **Identity**: Name, avatar, role title, specialization tags
- **Capabilities**: Structured skills with proficiency levels (not just "Role: X")
- **Soul**: Rich markdown personality — communication style, expertise areas, boundaries
- **Model Config**: Preferred LLM, fallback, thinking mode
- **Performance**: Computed metrics from task history — tasks completed, success rate, avg time
- **Status Lifecycle**: `idle` → `assigned` → `working` → `reviewing` → `idle` (expanded from online/offline/busy)

### Agent Templates

Pre-configured templates for quick creation:

| Template | Role | Skills | Default Model |
|----------|------|--------|---------------|
| Researcher | Deep research & analysis | research, writing, data-analysis | Claude Opus |
| Developer | Code & technical work | coding, debugging, architecture, docs | Claude Sonnet |
| Writer | Content creation | copywriting, editing, seo, social-media | Claude Sonnet |
| Designer | Design & visual work | ui-design, branding, figma, prototyping | Claude Sonnet |
| Strategist | Planning & strategy | strategy, market-analysis, planning | Claude Opus |
| Analyst | Data & metrics | data-analysis, reporting, spreadsheets | Cerebras |

---

## 2. How Agents Map to OpenClaw

### Integration Model

```
Bullpen Agent  ←→  OpenClaw agentId
  └─ sessions  ←→  OpenClaw sessions (per task)
  └─ workspace ←→  OpenClaw workspace (SOUL.md, AGENTS.md, memory/)
  └─ tools     ←→  OpenClaw tool groups (fs, runtime, sessions, etc.)
```

**Key mappings:**
- `agent.openclawId` → OpenClaw `agents.list[].id` — unique agent in the runtime
- `agent.sessionKey` → OpenClaw session key — current active session
- `agent.skills` → mapped to OpenClaw tool groups + skill files in workspace
- `agent.soul` → synced to OpenClaw `SOUL.md` in agent workspace
- Task dispatch → `sessions.spawn()` with agent's model + task prompt

### Session Spawning Flow

```
1. Task assigned to agent
2. Bullpen calls OpenClaw sessions.spawn({
     task: taskDescription,
     agentId: agent.openclawId,
     model: agent.modelConfig.preferred,
     label: task.title
   })
3. OpenClaw creates isolated session in agent's workspace
4. Agent works with its SOUL.md personality + tool permissions
5. Result flows back via webhook → task completed
```

---

## 3. The Agent Schema

### Expanded `agents` table

```typescript
agents: defineTable({
  // Identity
  name: v.string(),
  avatar: v.optional(v.string()),
  role: v.optional(v.string()),               // "Researcher", "Developer", etc.

  // Status (expanded lifecycle)
  status: v.union(
    v.literal("idle"),
    v.literal("working"),
    v.literal("reviewing"),
    v.literal("offline")
  ),

  // Capabilities — structured skills
  skills: v.optional(v.array(v.object({
    name: v.string(),                          // "research", "coding", "copywriting"
    category: v.string(),                      // "technical", "creative", "analytical"
    level: v.union(
      v.literal("learning"),
      v.literal("proficient"),
      v.literal("expert")
    ),
  }))),

  // Specialization tags for routing
  tags: v.optional(v.array(v.string())),       // ["frontend", "react", "ux"]

  // Soul — rich personality (markdown)
  soul: v.optional(v.string()),                // Full markdown personality doc

  // Model configuration
  model: v.optional(v.string()),               // Preferred model ID
  modelFallback: v.optional(v.string()),       // Fallback model
  thinkingLevel: v.optional(v.union(
    v.literal("none"),
    v.literal("low"),
    v.literal("medium"),
    v.literal("high")
  )),

  // Tool permissions (OpenClaw tool groups)
  toolGroups: v.optional(v.array(v.string())), // ["fs", "runtime", "sessions", "memory"]

  // Performance metrics (updated on task completion)
  tasksCompleted: v.optional(v.number()),
  tasksSuccessRate: v.optional(v.number()),     // 0-100
  avgTaskDurationMs: v.optional(v.number()),

  // Timestamps
  lastSeen: v.number(),
  createdAt: v.optional(v.number()),

  // Current work
  currentTaskId: v.optional(v.id("tasks")),

  // OpenClaw integration
  openclawId: v.optional(v.string()),          // OpenClaw agent ID
  sessionKey: v.optional(v.string()),          // Current active session
  channel: v.optional(v.string()),             // Channel (discord, telegram, etc.)

  // Flexible extras
  metadata: v.optional(v.any()),
})
```

### New `agent_templates` table

```typescript
agent_templates: defineTable({
  name: v.string(),                            // "Researcher", "Developer"
  icon: v.string(),                            // "🔬", "💻"
  role: v.string(),
  skills: v.array(v.object({
    name: v.string(),
    category: v.string(),
    level: v.string(),
  })),
  tags: v.array(v.string()),
  defaultModel: v.string(),
  soulTemplate: v.string(),                    // Default SOUL.md content
  toolGroups: v.array(v.string()),
})
```

### Migration Safety

All new fields are `v.optional()` — existing agents continue to work. The expanded status values (`idle`, `working`, `reviewing`) replace the old values (`online`, `busy`, `offline`) but we map them at query time for backward compat.

---

## 4. Agent Creation Flow

### Template-Based (Quick)

1. User clicks "New Agent" → template picker grid
2. Select a template (Researcher, Developer, Writer, etc.)
3. Modal pre-fills: name, role, skills, soul, model, tags
4. User can customize name and review settings
5. Click "Create" → done

### Custom Builder

1. User clicks "Custom Agent" → multi-section form
2. **Identity**: Name, avatar, role
3. **Skills**: Pick from skill categories, set proficiency
4. **Soul**: Markdown editor with placeholder prompts
5. **Model**: Select preferred + fallback + thinking level
6. **Tools**: Toggle tool groups
7. Create

---

## 5. Agent Detail View

### Tabbed Interface

**Overview Tab:**
- Agent profile header (avatar, name, role, status, tags)
- Performance stats row (tasks completed, success rate, avg time)
- Current task (if working)
- Recent activity timeline

**Skills Tab:**
- Skills grid with proficiency indicators
- Add/remove skills
- Category grouping

**Activity Tab:**
- Full task history for this agent
- Events timeline
- Session history (if OpenClaw linked)

**Config Tab:**
- Soul editor (markdown)
- Model settings
- Tool permissions toggles
- OpenClaw session info
- Danger zone (delete agent)

---

## 6. Smart Task Routing

### Matching Algorithm

```
score(agent, task) = skillMatch * 0.4 + tagMatch * 0.3 + availability * 0.2 + performance * 0.1
```

- **skillMatch**: How many required skills does the agent have? What proficiency?
- **tagMatch**: Do the task tags overlap with agent tags?
- **availability**: Is the agent idle?
- **performance**: Historical success rate + speed

### Implementation

Tasks can optionally specify `requiredSkills` and `tags`. When dispatching:
1. Filter to idle agents with matching skills
2. Score each by the algorithm above
3. Suggest top matches (or auto-assign highest score)

---

## 7. File Changes Summary

| File | Change |
|------|--------|
| `convex/schema.ts` | Expand agents table, add agent_templates |
| `convex/agents.ts` | New create flow, metrics updates, template queries |
| `src/app/agents/page.tsx` | Rich agent cards, template picker, skill filters |
| `src/components/dashboard/agent-detail.tsx` | Tabbed profile view |
| `src/components/dashboard/agent-list.tsx` | Updated to show skills + role |
