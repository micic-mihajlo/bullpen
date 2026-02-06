# Bullpen — Master Backend Plan

_Generated 2026-02-06 by The Clawdfather's war room: Opus 4.6 (architecture) + Codex 5.3 (codebase audit)_

---

# Part 1: Architecture & Backend Plan

# 🐂 Bullpen — Comprehensive Backend Plan

> **Author:** Systems Architect | **Date:** 2026-02-06
> **Status:** Draft v1 — ready for review
> **Repo:** `micic-mihajlo/bullpen`

---

## Table of Contents

1. [Core Architecture](#1-core-architecture)
2. [Database Schema Evolution](#2-database-schema-evolution)
3. [Integrations Needed](#3-integrations-needed)
4. [Agent Orchestration Layer](#4-agent-orchestration-layer)
5. [Dashboard Features](#5-dashboard-features-appsdashboard)
6. [DevOps & Infrastructure](#6-devops--infrastructure)
7. [MVP Roadmap](#7-mvp-roadmap)
8. [Open Questions / Risks](#8-open-questions--risks)

---

## 1. Core Architecture

### 1.1 System Overview

Bullpen has four layers, each with a clear responsibility:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
│                                                                             │
│  apps/landing (port 3004)          apps/dashboard (port 3001)               │
│  ┌───────────────────────┐         ┌────────────────────────────────────┐   │
│  │  Marketing site        │         │  Client Portal    Operator Portal  │   │
│  │  Pricing / CTA         │         │  ┌─────────────┐  ┌────────────┐  │   │
│  │  Stripe Checkout →     │────────▶│  │ Project view │  │ Admin view │  │   │
│  │  Onboarding flow       │         │  │ Deliverables │  │ Review Q   │  │   │
│  │                        │         │  │ Messages     │  │ Billing    │  │   │
│  └───────────────────────┘         │  └─────────────┘  └────────────┘  │   │
│                                     └──────────────┬───────────────────┘   │
└────────────────────────────────────────────────────┼───────────────────────┘
                                                     │
                                                     │ Convex React hooks
                                                     │ (real-time subscriptions)
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA & LOGIC LAYER (Convex)                          │
│                                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐    │
│  │ clients  │ │ projects │ │  tasks   │ │deliverbles│ │ subscriptions│    │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ └──────────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐    │
│  │  agents  │ │  events  │ │ messages │ │   files   │ │  sla_records │    │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ └──────────────┘    │
│                                                                             │
│  Convex Functions: queries, mutations, actions, scheduled jobs              │
│  Convex HTTP Actions: webhook endpoints, Stripe webhooks                    │
│  Convex Cron Jobs: SLA monitoring, agent heartbeat checks                   │
└───────────────────────────┬─────────────────────────────────────────────────┘
                            │
                            │ HTTP actions / internal calls
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER (OpenClaw)                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    OpenClaw Gateway (ws://localhost:18789)           │    │
│  │                                                                     │    │
│  │  sessions.spawn()  →  Isolated agent sessions                       │    │
│  │  sessions.list()   →  Running session inventory                     │    │
│  │  chat.send()       →  Human-in-the-loop messages                    │    │
│  │  chat.history()    →  Audit trail                                   │    │
│  └──────────┬──────────────────────┬──────────────────┬────────────────┘    │
│             │                      │                  │                      │
│  ┌──────────▼──────┐  ┌───────────▼──────┐  ┌───────▼────────────────┐     │
│  │  Researcher      │  │  Writer/Editor   │  │  Coder/Designer       │     │
│  │  Agent Session   │  │  Agent Session   │  │  Agent Session        │     │
│  │  (cerebras/...)  │  │  (claude-4/...)  │  │  (claude-4/cursor)   │     │
│  └─────────────────┘  └──────────────────┘  └───────────────────────┘     │
│                                                                             │
│  bullpen-sync hook → lifecycle events → /api/webhooks/agent-event           │
│  task completion   → result webhook   → /api/webhooks/task-result           │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES LAYER                                │
│                                                                             │
│  Stripe (payments)  │  Clerk (auth)  │  Resend (email)  │  Convex Files    │
│  Slack/Discord      │  Cal.com       │  Sentry          │  Vercel          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow: Client Submits → Agents Work → Deliverable Shipped

This is the core loop. Every dollar of revenue flows through this pipeline.

```
Phase 1: INTAKE
═══════════════════════════════════════════════════════════════
Client                  Landing Page             Convex
  │                         │                       │
  ├─ Selects plan ─────────▶│                       │
  │  (Sprint/Pro/Scale)     │                       │
  │                         ├─ Stripe Checkout ────▶│ (subscription created)
  │                         │                       │
  ├─ Fills project brief ──▶│                       │
  │  (form or intake call)  │                       │
  │                         ├─ Create client ──────▶│ clients + subscriptions
  │                         ├─ Create project ─────▶│ projects (status: intake)
  │                         │                       │
  │◀─ Welcome email ───────────────────────────────▶│ (Resend transactional)
  │◀─ Slack/Discord invite ─│                       │
  │                         │                       │

Phase 2: PLANNING (Operator)
═══════════════════════════════════════════════════════════════
Operator                Dashboard                Convex
  │                         │                       │
  ├─ Reviews project brief ▶│                       │
  │                         │                       │
  ├─ Breaks into tasks ────▶│                       │
  │  (research, draft,      ├─ Create tasks ───────▶│ tasks[] (status: pending)
  │   design, code, etc.)   │                       │
  │                         │                       │
  ├─ Assigns agents ───────▶│                       │
  │  (based on speciality)  ├─ Assign tasks ───────▶│ tasks (status: assigned)
  │                         │                       │
  ├─ Sets priority/SLA ────▶│                       │
  │                         ├─ Create SLA record ──▶│ sla_records
  │                         │                       │
  ├─ Clicks "Dispatch" ────▶│                       │
  │                         │                       │

Phase 3: EXECUTION (Agents)
═══════════════════════════════════════════════════════════════
Dashboard               OpenClaw Gateway         Agent Session
  │                         │                       │
  ├─ POST /dispatch ───────▶│                       │
  │                         ├─ sessions.spawn() ───▶│
  │                         │   (task prompt +       │
  │                         │    webhook URL +       │
  │                         │    model config)       │
  │                         │                       ├──── Does work
  │                         │                       │     (web search,
  │                         │                       │      code generation,
  │                         │                       │      content writing,
  │                         │                       │      design comps)
  │                         │                       │
  │                         │                       ├──── Stores artifacts
  │                         │                       │     (Convex file storage)
  │                         │                       │
  │◀──── Real-time events ◀─┤◀── bullpen-sync hook ─┤
  │   (Convex subscription) │                       │
  │                         │                       │
  │                         │◀── POST /task-result ──┤ (webhook: completed)
  │                         │                       │
  ├─ Task → completed ─────▶│                       │
  │   (Convex mutation)     │                       │

Phase 4: REVIEW (Human-in-the-Loop)
═══════════════════════════════════════════════════════════════
Agent Output            Operator Dashboard       Convex
  │                         │                       │
  ├─ Draft deliverable ────▶│                       │
  │                         ├─ deliverable created ▶│ deliverables (draft)
  │                         │                       │
  │                    Operator reviews              │
  │                         │                       │
  │                  ┌──────┤                       │
  │                  │      │                       │
  │          ┌───────┴──┐ ┌─┴────────┐              │
  │          │ APPROVE  │ │  REJECT  │              │
  │          │          │ │(w/ notes)│              │
  │          └────┬─────┘ └─┬────────┘              │
  │               │         │                       │
  │               ▼         ▼                       │
  │          delivered   revision                    │
  │          to client   dispatched                  │
  │                     back to agent               │

Phase 5: DELIVERY
═══════════════════════════════════════════════════════════════
Operator                Dashboard                Client
  │                         │                       │
  ├─ Approves deliverable ─▶│                       │
  │                         ├─ Status → delivered ──│
  │                         │                       │
  │                         ├─ Email notification ──▶│
  │                         │  (Resend + link)       │
  │                         │                       │
  │                         ├─ Slack/Discord msg ───▶│
  │                         │  "Your deliverable     │
  │                         │   is ready!"           │
  │                         │                       │
  │                         │                 Client downloads
  │                         │                 from portal
  │                         │                       │
  │                         ├─ Project → delivered ─▶│
  │                         │  (if all deliverables) │
```

### 1.3 Real-Time Updates Architecture

**Why Convex is perfect here:** Convex subscriptions are automatic. Every `useQuery` call in React creates a live subscription — when data changes server-side, every connected client sees it instantly. No WebSocket plumbing needed.

**Subscription Map:**

| Who | Subscribes To | Why |
|-----|---------------|-----|
| Client (portal) | `projects.byClient`, `deliverables.byProject`, `clientMessages.byThread` | See their project status, deliverables, communicate |
| Operator | `projects.list`, `tasks.list`, `deliverables.pendingReview`, `events.recent` | Full overview, review queue, event feed |
| Operator | `agents.list`, `slaRecords.atRisk` | Agent health, SLA warnings |
| Dashboard (auto) | `subscriptions.byClient` | Billing status, usage tracking |

**Event Feed Architecture (existing, extended):**

The `events` table is the system's audit log. Every state change writes an event. The dashboard already subscribes to `events.recent` for the live feed. We extend this with:

- Client-visible events (filtered by `clientId`)
- SLA-related events (deadline warnings, breaches)
- Billing events (payment received, subscription changed)

**Convex Cron Jobs (new):**

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Check SLA compliance every 15 minutes
crons.interval("sla-monitor", { minutes: 15 }, "slaMonitor:checkDeadlines");

// Check agent heartbeats every 5 minutes
crons.interval("agent-heartbeat-check", { minutes: 5 }, "agents:checkHeartbeats");

// Daily billing usage snapshot
crons.daily("billing-snapshot", { hourUTC: 0, minuteUTC: 0 }, "billing:dailySnapshot");

// Weekly analytics aggregation
crons.weekly("analytics-rollup", { dayOfWeek: "monday", hourUTC: 2, minuteUTC: 0 }, "analytics:weeklyRollup");

export default crons;
```

---

## 2. Database Schema Evolution

### 2.1 What Exists (Current State)

Already in `apps/dashboard/convex/schema.ts`:
- `clients` — name, email, company, status, plan (string only)
- `projects` — clientId, name, type, brief, status, deadline, budget
- `agents` — name, status, soul, model, sessionKey (OpenClaw link)
- `tasks` — title, description, status, projectId, assignedAgentId, priority
- `deliverables` — projectId, taskId, title, content, format, status
- `events` — agentId, type, message, data, timestamp
- `messages` — fromAgentId, toAgentId, content (agent-to-agent only)

### 2.2 What Needs to Change

**Guiding principle:** Keep the existing tables, add fields where needed, add new tables for new domains. Never break what works.

#### A. `clients` table — ADD FIELDS

```typescript
clients: defineTable({
  // === EXISTING (keep as-is) ===
  name: v.string(),
  email: v.string(),
  company: v.optional(v.string()),
  avatar: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("churned")),
  plan: v.optional(v.string()),
  channel: v.optional(v.string()),
  channelId: v.optional(v.string()),
  createdAt: v.number(),
  metadata: v.optional(v.any()),

  // === NEW FIELDS ===
  clerkUserId: v.optional(v.string()),       // Clerk auth link
  stripeCustomerId: v.optional(v.string()),  // Stripe customer ID
  onboardedAt: v.optional(v.number()),       // When onboarding completed
  timezone: v.optional(v.string()),          // Client timezone (for SLA calc)
  slackChannelId: v.optional(v.string()),    // Dedicated Slack channel
  discordChannelId: v.optional(v.string()),  // Dedicated Discord channel
})
  .index("by_email", ["email"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"])
  .index("by_clerk_user", ["clerkUserId"])     // NEW
  .index("by_stripe_customer", ["stripeCustomerId"]) // NEW
```

#### B. `projects` table — ADD FIELDS

```typescript
projects: defineTable({
  // === EXISTING ===
  clientId: v.id("clients"),
  name: v.string(),
  type: v.string(),
  brief: v.optional(v.string()),
  status: v.union(
    v.literal("intake"),
    v.literal("active"),
    v.literal("review"),
    v.literal("delivered"),
    v.literal("archived")
  ),
  deadline: v.optional(v.number()),
  budget: v.optional(v.number()),
  createdAt: v.number(),
  deliveredAt: v.optional(v.number()),
  metadata: v.optional(v.any()),

  // === NEW FIELDS ===
  subscriptionId: v.optional(v.id("subscriptions")), // Which sub is paying for this
  tier: v.optional(v.string()),                       // "sprint" | "pro" | "scale"
  slaResponseHours: v.optional(v.number()),           // 24, 48, or same-day (8)
  slaDeliveryHours: v.optional(v.number()),           // 48-72, 24, 8
  maxRevisions: v.optional(v.number()),               // 2 (Sprint), unlimited (Pro/Scale)
  revisionCount: v.optional(v.number()),              // Current revision count
  priority: v.optional(v.number()),                   // 1-5, derived from tier
  tags: v.optional(v.array(v.string())),              // ["website", "react", "design"]
})
  .index("by_client", ["clientId"])
  .index("by_status", ["status"])
  .index("by_type", ["type"])
  .index("by_created", ["createdAt"])
  .index("by_subscription", ["subscriptionId"])  // NEW
  .index("by_tier", ["tier"])                    // NEW
```

#### C. `agents` table — ADD FIELDS

```typescript
agents: defineTable({
  // === EXISTING ===
  name: v.string(),
  status: v.union(v.literal("online"), v.literal("offline"), v.literal("busy")),
  soul: v.optional(v.string()),
  avatar: v.optional(v.string()),
  model: v.optional(v.string()),
  lastSeen: v.number(),
  currentTaskId: v.optional(v.id("tasks")),
  metadata: v.optional(v.any()),
  sessionKey: v.optional(v.string()),
  channel: v.optional(v.string()),

  // === NEW FIELDS ===
  specialization: v.optional(v.string()),     // "researcher" | "writer" | "coder" | "designer" | "reviewer" | "general"
  capabilities: v.optional(v.array(v.string())), // ["web_search", "code_execution", "image_generation", "file_access"]
  maxConcurrentTasks: v.optional(v.number()), // How many tasks can run in parallel (default 1)
  totalTasksCompleted: v.optional(v.number()), // Lifetime counter
  avgCompletionTimeMs: v.optional(v.number()), // Rolling average
  failureRate: v.optional(v.number()),         // 0.0 - 1.0
  costPerTask: v.optional(v.number()),         // Estimated cost in cents (model inference)
  isCustom: v.optional(v.boolean()),           // Scale tier custom-trained agent
  customForClientId: v.optional(v.id("clients")), // Dedicated to which client
})
  .index("by_status", ["status"])
  .index("by_name", ["name"])
  .index("by_session", ["sessionKey"])
  .index("by_specialization", ["specialization"])  // NEW
  .index("by_custom_client", ["customForClientId"]) // NEW
```

#### D. `tasks` table — ADD FIELDS

```typescript
tasks: defineTable({
  // === EXISTING ===
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("assigned"),
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed")
  ),
  projectId: v.optional(v.id("projects")),
  assignedAgentId: v.optional(v.id("agents")),
  priority: v.optional(v.number()),
  createdAt: v.number(),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  result: v.optional(v.string()),
  error: v.optional(v.string()),

  // === NEW FIELDS ===
  parentTaskId: v.optional(v.id("tasks")),      // For task decomposition (parent → subtasks)
  taskType: v.optional(v.string()),              // "research" | "draft" | "code" | "design" | "review" | "revision"
  requiredSpecialization: v.optional(v.string()), // What kind of agent should handle this
  estimatedDurationMs: v.optional(v.number()),   // Estimated time to complete
  actualDurationMs: v.optional(v.number()),      // Actual time (completedAt - startedAt)
  retryCount: v.optional(v.number()),            // How many times this has been retried
  maxRetries: v.optional(v.number()),            // Max retry limit (default 2)
  dispatchedSessionKey: v.optional(v.string()),  // OpenClaw session that's running this
  artifacts: v.optional(v.array(v.string())),    // File storage IDs for outputs
  dependsOn: v.optional(v.array(v.id("tasks"))), // Task dependencies (run after these complete)
})
  .index("by_status", ["status"])
  .index("by_project", ["projectId"])
  .index("by_agent", ["assignedAgentId"])
  .index("by_created", ["createdAt"])
  .index("by_parent", ["parentTaskId"])              // NEW
  .index("by_type", ["taskType"])                    // NEW
  .index("by_dispatched_session", ["dispatchedSessionKey"]) // NEW
```

#### E. `deliverables` table — ADD FIELDS (versioning)

```typescript
deliverables: defineTable({
  // === EXISTING ===
  projectId: v.id("projects"),
  taskId: v.optional(v.id("tasks")),
  title: v.string(),
  content: v.string(),
  format: v.string(),
  status: v.union(
    v.literal("draft"),
    v.literal("review"),
    v.literal("approved"),
    v.literal("delivered"),
    v.literal("rejected")
  ),
  reviewedBy: v.optional(v.string()),
  reviewNotes: v.optional(v.string()),
  createdAt: v.number(),
  deliveredAt: v.optional(v.number()),

  // === NEW FIELDS ===
  version: v.optional(v.number()),                  // 1, 2, 3... (increments on revision)
  previousVersionId: v.optional(v.id("deliverables")), // Link to prior version
  fileIds: v.optional(v.array(v.string())),         // Convex file storage IDs
  sourceFileIds: v.optional(v.array(v.string())),   // Source files (PSD, Figma, etc.)
  externalUrl: v.optional(v.string()),              // Link to Figma, deployed site, etc.
  clientVisible: v.optional(v.boolean()),           // Show in client portal? (default false until delivered)
  clientFeedback: v.optional(v.string()),           // Client's feedback after delivery
  clientRating: v.optional(v.number()),             // 1-5 satisfaction score
  revisionRequestedAt: v.optional(v.number()),      // When client requested changes
  revisionNotes: v.optional(v.string()),            // What the client wants changed
})
  .index("by_project", ["projectId"])
  .index("by_status", ["status"])
  .index("by_task", ["taskId"])
  .index("by_version", ["projectId", "version"])    // NEW: find versions per project
```

### 2.3 NEW TABLES

#### F. `subscriptions` — Billing & Plan Tracking

```typescript
subscriptions: defineTable({
  clientId: v.id("clients"),
  stripeSubscriptionId: v.optional(v.string()),  // Stripe sub ID (null for Sprint)
  stripePaymentIntentId: v.optional(v.string()), // For one-time Sprint payments
  plan: v.union(
    v.literal("sprint"),
    v.literal("pro"),
    v.literal("scale")
  ),
  status: v.union(
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled"),
    v.literal("completed"),  // Sprint finished
    v.literal("trialing")
  ),
  priceAmountCents: v.number(),     // 250000, 450000, 900000
  billingInterval: v.optional(v.string()), // "month" | null (one-time)

  // Usage tracking
  deliverablesIncluded: v.optional(v.number()),  // 1 (Sprint), 4 (Pro), null (Scale = unlimited)
  deliverablesUsed: v.number(),                  // Current period usage
  periodStart: v.number(),                       // Current billing period start
  periodEnd: v.optional(v.number()),             // Current billing period end

  // SLA parameters (derived from plan)
  responseTimeHours: v.number(),    // 72 (Sprint), 24 (Pro), 8 (Scale)
  revisionRounds: v.optional(v.number()), // 2 (Sprint), null = unlimited

  createdAt: v.number(),
  canceledAt: v.optional(v.number()),
  metadata: v.optional(v.any()),
})
  .index("by_client", ["clientId"])
  .index("by_stripe_sub", ["stripeSubscriptionId"])
  .index("by_status", ["status"])
  .index("by_plan", ["plan"])
```

#### G. `clientMessages` — Client Communication Threads

This is *separate* from the existing `messages` table (which is agent-to-agent). Client messages are between the client and the operator/team.

```typescript
clientMessages: defineTable({
  clientId: v.id("clients"),
  projectId: v.optional(v.id("projects")),  // Scoped to a project, or general
  threadId: v.string(),                      // Group messages into threads
  sender: v.union(
    v.literal("client"),
    v.literal("operator"),
    v.literal("agent"),
    v.literal("system")
  ),
  senderName: v.string(),                   // Display name
  content: v.string(),
  attachmentIds: v.optional(v.array(v.string())), // File storage IDs
  channel: v.optional(v.string()),          // "portal" | "slack" | "discord" | "email"
  externalMessageId: v.optional(v.string()), // ID in external system
  read: v.boolean(),
  createdAt: v.number(),
})
  .index("by_client", ["clientId"])
  .index("by_project", ["projectId"])
  .index("by_thread", ["threadId"])
  .index("by_created", ["createdAt"])
```

#### H. `slaRecords` — SLA Monitoring

```typescript
slaRecords: defineTable({
  projectId: v.id("projects"),
  clientId: v.id("clients"),
  type: v.union(
    v.literal("first_response"),     // Time to first meaningful response
    v.literal("deliverable_due"),    // Deliverable deadline
    v.literal("revision_due"),       // Revision turnaround
    v.literal("message_response")    // Response to client message
  ),
  status: v.union(
    v.literal("on_track"),
    v.literal("at_risk"),        // <20% time remaining
    v.literal("breached"),       // Deadline passed
    v.literal("met")             // Completed on time
  ),
  deadlineAt: v.number(),       // When this SLA expires
  startedAt: v.number(),        // When the clock started
  completedAt: v.optional(v.number()), // When fulfilled
  targetHours: v.number(),      // SLA target in hours
  actualHours: v.optional(v.number()), // Actual time taken
  notes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_client", ["clientId"])
  .index("by_status", ["status"])
  .index("by_deadline", ["deadlineAt"])
```

#### I. `timeEntries` — Time Tracking

```typescript
timeEntries: defineTable({
  projectId: v.id("projects"),
  taskId: v.optional(v.id("tasks")),
  agentId: v.optional(v.id("agents")),  // Which agent (or null for human)
  operatorId: v.optional(v.string()),   // Clerk user ID for human time
  type: v.union(
    v.literal("agent_execution"),  // AI agent working time
    v.literal("operator_review"),  // Human QA/review time
    v.literal("client_meeting"),   // Strategy call
    v.literal("admin")             // Overhead
  ),
  durationMs: v.number(),
  startedAt: v.number(),
  endedAt: v.number(),
  description: v.optional(v.string()),
  billable: v.boolean(),
})
  .index("by_project", ["projectId"])
  .index("by_task", ["taskId"])
  .index("by_agent", ["agentId"])
  .index("by_started", ["startedAt"])
```

#### J. `agentConfigs` — Custom Agent Configurations (Scale Tier)

```typescript
agentConfigs: defineTable({
  clientId: v.id("clients"),
  agentId: v.id("agents"),
  name: v.string(),                        // "Acme Brand Writer"
  systemPrompt: v.string(),                // Custom system prompt
  brandGuidelines: v.optional(v.string()), // Brand voice, style, rules
  knowledgeBase: v.optional(v.array(v.string())), // File IDs for reference docs
  model: v.optional(v.string()),           // Preferred model override
  temperature: v.optional(v.number()),     // Model temperature
  tools: v.optional(v.array(v.string())),  // Allowed tools
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_client", ["clientId"])
  .index("by_agent", ["agentId"])
```

#### K. `invoices` — Invoice Records (mirrors Stripe but queryable)

```typescript
invoices: defineTable({
  clientId: v.id("clients"),
  subscriptionId: v.optional(v.id("subscriptions")),
  stripeInvoiceId: v.string(),
  amountCents: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("open"),
    v.literal("paid"),
    v.literal("void"),
    v.literal("uncollectible")
  ),
  paidAt: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  invoiceUrl: v.optional(v.string()),  // Stripe hosted invoice URL
  createdAt: v.number(),
})
  .index("by_client", ["clientId"])
  .index("by_subscription", ["subscriptionId"])
  .index("by_status", ["status"])
  .index("by_stripe_invoice", ["stripeInvoiceId"])
```

### 2.4 Schema Summary — What Changes

| Action | Table | Change |
|--------|-------|--------|
| MODIFY | `clients` | +4 fields (clerkUserId, stripeCustomerId, onboardedAt, timezone, slackChannelId, discordChannelId) |
| MODIFY | `projects` | +7 fields (subscriptionId, tier, sla*, maxRevisions, revisionCount, priority, tags) |
| MODIFY | `agents` | +8 fields (specialization, capabilities, performance metrics, custom agent fields) |
| MODIFY | `tasks` | +9 fields (parentTaskId, taskType, requiredSpecialization, duration tracking, retry, dependencies) |
| MODIFY | `deliverables` | +9 fields (versioning, files, client feedback, rating) |
| NEW | `subscriptions` | Billing/plan tracking |
| NEW | `clientMessages` | Client↔operator communication |
| NEW | `slaRecords` | SLA monitoring |
| NEW | `timeEntries` | Time tracking |
| NEW | `agentConfigs` | Custom agent configs (Scale tier) |
| NEW | `invoices` | Invoice records |

---

## 3. Integrations Needed

### 3.1 Payment Processing — Stripe

**Why Stripe:** Industry standard. Handles both one-time payments (Sprint) and recurring subscriptions (Pro/Scale). Has webhooks, customer portal, invoicing, and tax handling out of the box.

**Architecture:**

```
Landing Page (CTA click)
    │
    ├─ Sprint: Stripe Checkout (mode: "payment")
    │   └─ One-time $2,500 charge
    │   └─ Success → redirect to onboarding
    │
    ├─ Pro: Stripe Checkout (mode: "subscription")
    │   └─ $4,500/mo recurring
    │   └─ Success → redirect to onboarding
    │
    └─ Scale: Stripe Checkout (mode: "subscription")
        └─ $9,000/mo recurring
        └─ Success → redirect to onboarding

Stripe Webhooks → Convex HTTP Action
    │
    ├─ checkout.session.completed → Create client + subscription in Convex
    ├─ invoice.paid → Update subscription status, log invoice
    ├─ invoice.payment_failed → Mark past_due, alert operator
    ├─ customer.subscription.updated → Sync plan changes
    └─ customer.subscription.deleted → Mark canceled, alert operator
```

**Implementation — Convex HTTP Actions:**

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { stripeWebhook } from "./stripe";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
```

```typescript
// convex/stripe.ts
import { httpAction } from "./_generated/server";
import Stripe from "stripe";

export const stripeWebhook = httpAction(async (ctx, request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = request.headers.get("stripe-signature")!;
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Create/update client + subscription via internal mutation
      await ctx.runMutation(internal.billing.handleCheckoutCompleted, {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string | null,
        email: session.customer_email!,
        plan: session.metadata?.plan || "sprint",
        amountCents: session.amount_total!,
      });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object;
      await ctx.runMutation(internal.billing.handleInvoicePaid, {
        stripeInvoiceId: invoice.id,
        stripeCustomerId: invoice.customer as string,
        amountCents: invoice.amount_paid,
        invoiceUrl: invoice.hosted_invoice_url,
      });
      break;
    }
    case "invoice.payment_failed": {
      await ctx.runMutation(internal.billing.handlePaymentFailed, {
        stripeCustomerId: event.data.object.customer as string,
      });
      break;
    }
    case "customer.subscription.deleted": {
      await ctx.runMutation(internal.billing.handleSubscriptionCanceled, {
        stripeSubscriptionId: event.data.object.id,
      });
      break;
    }
  }

  return new Response("ok", { status: 200 });
});
```

**Stripe Products to Create:**

| Product | Price ID | Type | Amount |
|---------|----------|------|--------|
| Bullpen Sprint | `price_sprint` | One-time | $2,500 |
| Bullpen Pro | `price_pro_monthly` | Recurring/month | $4,500 |
| Bullpen Scale | `price_scale_monthly` | Recurring/month | $9,000 |

**Client-side Checkout:**

```typescript
// apps/landing/src/app/api/checkout/route.ts
export async function POST(request: NextRequest) {
  const { plan, email } = await request.json();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const prices = {
    sprint: { priceId: process.env.STRIPE_PRICE_SPRINT!, mode: "payment" as const },
    pro: { priceId: process.env.STRIPE_PRICE_PRO!, mode: "subscription" as const },
    scale: { priceId: process.env.STRIPE_PRICE_SCALE!, mode: "subscription" as const },
  };

  const config = prices[plan as keyof typeof prices];

  const session = await stripe.checkout.sessions.create({
    mode: config.mode,
    customer_email: email,
    line_items: [{ price: config.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_LANDING_URL}/#pricing`,
    metadata: { plan },
  });

  return NextResponse.json({ url: session.url });
}
```

### 3.2 Authentication — Clerk

**Why Clerk:** Best DX for Next.js. Handles sign-up, sign-in, session management, organizations (useful if we add teams later), and has Convex integration out of the box.

**Two auth contexts:**

1. **Client auth** — Clients sign up via Clerk during onboarding. They see only their own data.
2. **Operator auth** — You (Mihajlo) sign in as admin. See everything. This can be a hardcoded Clerk user ID check initially.

**Implementation:**

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

```typescript
// Convex function with auth check
export const myClientProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const client = await ctx.db
      .query("clients")
      .withIndex("by_clerk_user", q => q.eq("clerkUserId", identity.subject))
      .first();

    if (!client) throw new Error("Client not found");

    return ctx.db
      .query("projects")
      .withIndex("by_client", q => q.eq("clientId", client._id))
      .collect();
  },
});
```

**Role-based access (simple, no RBAC overkill):**

```typescript
// convex/lib/auth.ts
export async function requireOperator(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const OPERATOR_CLERK_IDS = [process.env.OPERATOR_CLERK_ID]; // Your Clerk ID
  if (!OPERATOR_CLERK_IDS.includes(identity.subject)) {
    throw new Error("Unauthorized: operator access required");
  }
  return identity;
}

export async function requireClient(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const client = await ctx.db
    .query("clients")
    .withIndex("by_clerk_user", q => q.eq("clerkUserId", identity.subject))
    .first();

  if (!client) throw new Error("Client not found");
  return { identity, client };
}
```

### 3.3 File Storage — Convex File Storage

**Why Convex Files:** Already integrated. No extra service. Handles upload, download, and serves files via signed URLs. Perfect for deliverables, source files, and attachments.

**Usage pattern:**

```typescript
// Upload from client/operator
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAuth(ctx); // Either client or operator
    return await ctx.storage.generateUploadUrl();
  },
});

// Get download URL
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

**File types we'll store:**
- Deliverable assets (PDFs, images, code zips)
- Source files (PSD, Figma exports, raw code)
- Client brief attachments
- Agent knowledge base docs (Scale tier)
- Client avatars/logos

**Storage limits:** Convex free tier has 1GB. Pro plan ($25/mo) has 50GB. That's plenty for an agency doing mostly digital deliverables. Large files (video, huge design files) should link externally (Figma, Google Drive, GitHub).

### 3.4 Communication — Slack + Discord Bots

**Architecture:**

```
Client signs up (Pro/Scale)
    │
    ├─ Auto-create Slack channel: #client-{company-slug}
    │   └─ Invite client as guest
    │   └─ Pin project brief
    │   └─ Bot posts status updates
    │
    └─ OR auto-create Discord thread/channel
        └─ Same pattern

Messages flow:
    Slack/Discord ←→ Convex (clientMessages table) ←→ Dashboard Portal
    (bidirectional sync via bot webhooks)
```

**Slack Bot (recommended for Pro/Scale clients):**
- Use Slack Bolt SDK
- Run as a Convex HTTP action or a lightweight sidecar service
- Events: `message` → sync to Convex `clientMessages`
- Commands: `/bullpen status` → current project status
- Notifications: deliverable ready, deadline approaching, etc.

**Discord Bot (already have OpenClaw running here):**
- Leverage existing OpenClaw Discord integration
- Create per-client channels in a "Clients" category
- Post updates via Discord.js or OpenClaw's message tool

**MVP Opinion:** Start with Discord since you already have the OpenClaw bot there. Add Slack for Pro/Scale clients who prefer it. Most agencies use Slack.

### 3.5 Email — Resend

**Why Resend:** Modern, developer-friendly, great DX, React Email for templates. $20/mo for 50k emails is more than enough.

**Transactional emails needed:**

| Trigger | Email | To |
|---------|-------|----|
| Checkout complete | Welcome + onboarding link | Client |
| Project created | "Your project is underway" | Client |
| Deliverable ready | "Review your deliverable" + link | Client |
| Revision requested | "Revision in progress" | Client |
| SLA at risk | "Action needed" | Operator |
| Payment failed | "Update payment method" | Client |
| Invoice paid | Receipt | Client |
| Weekly digest | Project summary | Client (Pro/Scale) |

**Implementation:**

```typescript
// convex/email.ts (Convex action — can call external APIs)
import { action } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = action({
  args: { email: v.string(), name: v.string(), plan: v.string() },
  handler: async (ctx, args) => {
    await resend.emails.send({
      from: "Bullpen <hello@bullpen.agency>",
      to: args.email,
      subject: `Welcome to Bullpen, ${args.name}!`,
      react: WelcomeEmail({ name: args.name, plan: args.plan }),
    });
  },
});
```

### 3.6 Calendar — Cal.com

**Why Cal.com:** Open-source, self-hostable, has a great API. Free tier works for MVP. Used for weekly strategy calls (Pro/Scale).

**Integration:**
- Embed Cal.com scheduling widget in the client portal
- Auto-create a recurring weekly event for Pro/Scale clients
- Sync to Convex events table
- Send reminder emails via Resend

**MVP:** Just embed the Cal.com link in the dashboard. Don't over-engineer.

### 3.7 Analytics / Monitoring

| Tool | Purpose | Priority |
|------|---------|----------|
| **Sentry** | Error tracking (frontend + Convex functions) | MVP |
| **Convex Dashboard** | Built-in function metrics, logs | MVP (free) |
| **PostHog** (or Plausible) | Product analytics, funnels | Post-MVP |
| **Better Uptime** (or UptimeRobot) | Uptime monitoring | MVP (free tier) |

---

## 4. Agent Orchestration Layer

This is the brain of Bullpen. The existing `sessions.spawn()` pattern is solid. We need to formalize it.

### 4.1 How OpenClaw Dispatches Work

**Current flow (already works):**
1. Operator clicks "Dispatch" on a task in the dashboard
2. `POST /api/tasks/[id]/dispatch` is called
3. The route connects to OpenClaw Gateway via WebSocket
4. Calls `sessions.spawn()` with a task prompt
5. An isolated agent session starts, does the work
6. Agent calls `POST /api/webhooks/task-result` when done
7. Task status updates in Convex, dashboard updates in real-time

**What needs to change for production:**

#### Dispatcher Service (Convex Action)

Move dispatch logic from Next.js API route into a Convex action. This gives us:
- Retry logic built into Convex
- Transactional state updates
- No dependency on the Next.js server being up

```typescript
// convex/dispatcher.ts
import { action, internalMutation } from "./_generated/server";

export const dispatchTask = action({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.runQuery(internal.tasks.getInternal, { id: args.taskId });
    if (!task) throw new Error("Task not found");
    if (!task.assignedAgentId) throw new Error("Task not assigned");

    const agent = await ctx.runQuery(internal.agents.getInternal, { id: task.assignedAgentId });
    if (!agent) throw new Error("Agent not found");

    // Build task prompt (enhanced version of current dispatch logic)
    const prompt = buildTaskPrompt(task, agent);

    // Call OpenClaw Gateway via HTTP (not WebSocket - more reliable from Convex)
    const response = await fetch(`${process.env.OPENCLAW_API_URL}/api/sessions/spawn`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENCLAW_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: prompt,
        label: `bullpen-${task._id}`,
        model: agent.model,
        timeoutSeconds: 300,
        runTimeoutSeconds: getTimeoutForTask(task),
      }),
    });

    const result = await response.json();

    // Update task state
    await ctx.runMutation(internal.tasks.markDispatched, {
      taskId: args.taskId,
      sessionKey: result.sessionKey,
    });

    // Create SLA record
    await ctx.runMutation(internal.sla.createRecord, {
      projectId: task.projectId!,
      clientId: task.project?.clientId,
      type: "deliverable_due",
      targetHours: task.slaDeliveryHours || 72,
    });

    return result;
  },
});
```

#### Auto-Dispatch Queue

For tasks with dependencies, implement a queue processor:

```typescript
// convex/taskQueue.ts
export const processQueue = internalMutation({
  handler: async (ctx) => {
    // Find pending tasks whose dependencies are all completed
    const pendingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .collect();

    for (const task of pendingTasks) {
      if (!task.dependsOn || task.dependsOn.length === 0) continue;

      const allDepsComplete = await Promise.all(
        task.dependsOn.map(async (depId) => {
          const dep = await ctx.db.get(depId);
          return dep?.status === "completed";
        })
      );

      if (allDepsComplete.every(Boolean)) {
        // Auto-assign based on specialization
        const agent = await findBestAgent(ctx, task);
        if (agent) {
          await ctx.db.patch(task._id, {
            status: "assigned",
            assignedAgentId: agent._id,
          });
          // Schedule dispatch
          await ctx.scheduler.runAfter(0, internal.dispatcher.dispatchTask, {
            taskId: task._id,
          });
        }
      }
    }
  },
});
```

### 4.2 Agent Specialization

**Agent Roster (default — operator can customize):**

| Agent Name | Specialization | Model | Capabilities | When Used |
|------------|---------------|-------|--------------|-----------|
| Scout | `researcher` | `cerebras/zai-glm-4.7` (fast) | web_search, file_access | Market research, competitive analysis, data gathering |
| Quill | `writer` | `anthropic/claude-opus-4-6` | web_search, file_access | Blog posts, copy, documentation, reports |
| Forge | `coder` | `anthropic/claude-opus-4-6` | code_execution, file_access, web_search | MVPs, landing pages, scripts, automations |
| Pixel | `designer` | `anthropic/claude-opus-4-6` | image_generation, web_search | Design briefs, component specs, UI mockups |
| Edge | `reviewer` | `anthropic/claude-opus-4-6` | web_search, file_access | QA, code review, content editing |

**Routing logic:**

```typescript
function findBestAgent(ctx: MutationCtx, task: Task): Agent | null {
  const specialization = task.requiredSpecialization || inferSpecialization(task);

  // 1. Find agents with matching specialization that are online
  const candidates = await ctx.db
    .query("agents")
    .withIndex("by_specialization", q => q.eq("specialization", specialization))
    .filter(q => q.neq(q.field("status"), "offline"))
    .collect();

  // 2. If task belongs to a Scale client, prefer their custom agent
  if (task.project?.tier === "scale") {
    const customAgent = candidates.find(a => a.customForClientId === task.project?.clientId);
    if (customAgent && customAgent.status === "online") return customAgent;
  }

  // 3. Sort by: availability first, then performance
  const available = candidates.filter(a => a.status === "online");
  if (available.length === 0) return candidates[0]; // Fall back to busy agent (will queue)

  // Prefer agent with lowest failure rate and fastest completion
  return available.sort((a, b) => {
    const scoreA = (a.failureRate || 0) * 100 + (a.avgCompletionTimeMs || 0) / 60000;
    const scoreB = (b.failureRate || 0) * 100 + (b.avgCompletionTimeMs || 0) / 60000;
    return scoreA - scoreB;
  })[0];
}
```

### 4.3 Human-in-the-Loop QA Workflow

This is **critical**. AI output goes to clients who are paying $2,500-$9,000. Quality must be guaranteed.

```
Agent completes task
    │
    ▼
Deliverable created (status: "draft")
    │
    ▼
Auto-submit for review (status: "review")
    │
    ▼
Operator gets notification (dashboard + Slack/Discord)
    │
    ├─── APPROVE
    │       │
    │       ▼
    │   Deliverable → "approved"
    │       │
    │       ├─ If operator clicks "Deliver" → "delivered"
    │       │   └─ Client notified (email + portal + Slack)
    │       │   └─ Project status updated if all deliverables done
    │       │
    │       └─ Or hold for batch delivery
    │
    ├─── REQUEST REVISION
    │       │
    │       ▼
    │   Deliverable → "rejected" (with notes)
    │       │
    │       ▼
    │   New task auto-created: "Revision: {deliverable title}"
    │       │ description: operator's revision notes
    │       │ parentTaskId: original task
    │       │ taskType: "revision"
    │       │
    │       ▼
    │   Auto-dispatched to same agent
    │       │
    │       ▼
    │   New deliverable version created (version: N+1)
    │       │ previousVersionId: links to rejected version
    │       │
    │       └─ Loop back to review
    │
    └─── REJECT (rare - quality failure)
            │
            ▼
        Reassign to different agent
        Log quality issue for analytics
```

**Implementation:**

```typescript
// convex/review.ts
export const requestRevision = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Not found");

    // Reject the current version
    await ctx.db.patch(args.deliverableId, {
      status: "rejected",
      reviewedBy: "operator",
      reviewNotes: args.notes,
    });

    // Create revision task
    const originalTask = deliverable.taskId ? await ctx.db.get(deliverable.taskId) : null;

    const revisionTaskId = await ctx.db.insert("tasks", {
      title: `Revision: ${deliverable.title}`,
      description: `REVISION REQUEST:\n${args.notes}\n\nORIGINAL DELIVERABLE:\n${deliverable.content.slice(0, 500)}`,
      status: "pending",
      projectId: deliverable.projectId,
      assignedAgentId: originalTask?.assignedAgentId,
      taskType: "revision",
      parentTaskId: originalTask?._id,
      priority: 5, // Revisions are high priority
      createdAt: Date.now(),
    });

    // Update project revision count
    const project = await ctx.db.get(deliverable.projectId);
    if (project) {
      await ctx.db.patch(deliverable.projectId, {
        revisionCount: (project.revisionCount || 0) + 1,
      });
    }

    // Auto-dispatch
    await ctx.scheduler.runAfter(0, internal.dispatcher.dispatchTask, {
      taskId: revisionTaskId,
    });

    // Log event
    await ctx.db.insert("events", {
      type: "revision_requested",
      message: `Revision requested for "${deliverable.title}": ${args.notes.slice(0, 100)}`,
      data: { deliverableId: args.deliverableId, revisionTaskId },
      timestamp: Date.now(),
    });
  },
});
```

### 4.4 Task Queuing and Priority System

**Priority levels:**

| Priority | Label | Use Case | SLA Impact |
|----------|-------|----------|------------|
| 5 | **Critical** | Revisions, client-escalated, SLA at risk | Dispatched immediately |
| 4 | **High** | Scale tier work, same-day items | Dispatched within 1 hour |
| 3 | **Normal** | Pro tier work, standard flow | Dispatched within 4 hours |
| 2 | **Low** | Sprint tier, research tasks | Dispatched within 12 hours |
| 1 | **Background** | Internal improvements, knowledge base updates | Best-effort |

**Auto-priority assignment:**

```typescript
function calculatePriority(project: Project, taskType: string): number {
  let priority = 3; // Default

  // Tier-based
  if (project.tier === "scale") priority = 4;
  if (project.tier === "sprint") priority = 2;

  // Type-based overrides
  if (taskType === "revision") priority = 5;
  if (taskType === "review") priority = Math.max(priority, 4);

  // SLA-based escalation
  const hoursUntilDeadline = (project.deadline! - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilDeadline < 8) priority = 5;
  else if (hoursUntilDeadline < 24) priority = Math.max(priority, 4);

  return priority;
}
```

### 4.5 Custom-Trained Agents (Scale Tier)

"Custom-trained" doesn't mean fine-tuning a model (expensive, slow, unnecessary). It means:

1. **Custom system prompts** incorporating client's brand voice, guidelines, and preferences
2. **Knowledge base injection** — client docs, style guides, previous deliverables loaded into agent context
3. **Dedicated agent instances** that only work for this client
4. **Preference learning** — track what the operator edits in reviews, feed that back as guidelines

**Implementation:**

```typescript
// When dispatching a task for a Scale client
function buildScaleAgentPrompt(task: Task, agent: Agent, config: AgentConfig): string {
  return `
## Identity
You are ${agent.name}, a specialized ${agent.specialization} agent for ${config.name}.

## Brand Guidelines
${config.brandGuidelines || "No specific guidelines provided."}

## System Instructions
${config.systemPrompt}

## Reference Knowledge
${config.knowledgeBase ? "Relevant reference documents have been loaded." : "No reference docs."}

## Task
${task.title}

${task.description || ""}

## Quality Standards
- All output must match the brand voice described above
- Reference previous deliverables for consistency
- When in doubt, err toward the client's preferred style

${buildWebhookInstructions(task)}
`;
}
```

**Knowledge base loading:** Use Convex file storage to store client reference docs. When spawning the agent session, include relevant docs in the system prompt or as tool-accessible files. For larger knowledge bases (Scale tier), consider a simple RAG pipeline:

1. Upload docs → store in Convex
2. On spawn, pull relevant docs based on task type
3. Include as context in the agent prompt
4. For very large contexts, use a vector store (Pinecone/pgvector) — but this is a v2 concern

---

## 5. Dashboard Features (apps/dashboard)

### 5.1 Architecture: Two Portals, One App

```
apps/dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   │
│   │   ├── (client)/            # Client portal (authed as client)
│   │   │   ├── layout.tsx       # Client layout with sidebar
│   │   │   ├── projects/        # My projects
│   │   │   │   └── [id]/        # Single project view
│   │   │   ├── deliverables/    # My deliverables
│   │   │   ├── messages/        # Communication threads
│   │   │   ├── billing/         # Invoices, plan management
│   │   │   └── settings/        # Profile, notification preferences
│   │   │
│   │   ├── (operator)/          # Operator portal (authed as admin)
│   │   │   ├── layout.tsx       # Operator layout (current dashboard)
│   │   │   ├── page.tsx         # Command center (existing dashboard)
│   │   │   ├── clients/         # All clients
│   │   │   │   └── [id]/        # Client detail
│   │   │   ├── projects/        # All projects
│   │   │   │   └── [id]/        # Project detail with task breakdown
│   │   │   ├── review/          # Review queue (deliverables pending approval)
│   │   │   ├── agents/          # Agent management
│   │   │   │   └── [id]/        # Agent detail with config
│   │   │   ├── billing/         # Revenue dashboard
│   │   │   ├── analytics/       # Performance analytics
│   │   │   └── settings/        # Platform settings
│   │   │
│   │   └── api/                 # API routes (existing + new)
```

### 5.2 Client Portal

**What the client sees:**

#### Project Status Dashboard
```
┌─────────────────────────────────────────────────────┐
│  🐂 Bullpen                           John (Acme Co) │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│  📋 Projects  │  ┌─────────────────────────────────┐│
│  📦 Deliver.  │  │ Website Redesign        ACTIVE  ││
│  💬 Messages  │  │ ━━━━━━━━━━━━━━░░░ 73% complete  ││
│  💳 Billing   │  │                                  ││
│  ⚙️ Settings  │  │ Tasks:                           ││
│               │  │  ✅ Research & Analysis           ││
│               │  │  ✅ Wireframes                    ││
│               │  │  🔄 Design Mockups (in progress)  ││
│               │  │  ⏳ Development                   ││
│               │  │  ⏳ QA & Launch                   ││
│               │  │                                  ││
│               │  │ Timeline: Feb 3 → Feb 7          ││
│               │  │ Next milestone: Design review     ││
│               │  └─────────────────────────────────┘│
│               │                                     │
│               │  ┌─────────────────────────────────┐│
│               │  │ Recent Activity                  ││
│               │  │ • Wireframes v2 delivered (2h ago)││
│               │  │ • Design started (4h ago)        ││
│               │  │ • Research completed (yesterday) ││
│               │  └─────────────────────────────────┘│
└───────────────┴─────────────────────────────────────┘
```

**Features:**
- Project progress tracker (visual, simplified)
- Deliverable download + feedback/rating
- Inline messaging (syncs to Slack/Discord)
- Invoice history + Stripe Customer Portal link
- Request revision button on delivered items
- Schedule strategy call (Cal.com embed)

### 5.3 Operator Portal

**Extends the existing dashboard** (agents, tasks, events) with:

#### Command Center (enhanced home page)
```
┌─────────────────────────────────────────────────────────────────┐
│  🐂 bullpen / operator                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Revenue: $18,000 MRR  │  5 Active Clients  │  2 SLAs at Risk  │
│                                                                  │
├───────────┬──────────────────────┬──────────────────────────────┤
│           │                      │                               │
│  Agents   │   Review Queue (3)   │   Event Feed                 │
│  ─────    │   ──────────────     │   ──────────                 │
│  🟢 Scout │   📄 Landing page   │   • Quill completed draft    │
│  🟡 Quill │      for Acme       │   • Scout finished research  │
│  🟢 Forge │   📄 Blog post      │   • Invoice paid: $4,500     │
│  🔴 Pixel │      for Beta Inc   │   • New client: Gamma Labs   │
│  🟢 Edge  │   📄 API docs       │   • SLA warning: Acme proj   │
│           │      for Gamma       │                               │
│           │                      │                               │
│  Tasks    │   Click to review →  │                               │
│  ─────    │                      │                               │
│  ⚡ 3 run │                      │                               │
│  📋 5 pen │                      │                               │
│  ✓ 12 done│                      │                               │
│           │                      │                               │
└───────────┴──────────────────────┴──────────────────────────────┘
```

**Key screens:**

1. **Review Queue** — The most important screen. Shows all deliverables in "review" status. One-click approve/reject/revise. Inline content preview.

2. **Client Management** — List all clients, their plans, project status, billing status, SLA compliance. Click through to detail view with full history.

3. **Project Detail** — Break projects into tasks, assign agents, track progress. Gantt-style timeline view for complex projects.

4. **Agent Config** — View/edit agent prompts, specializations, performance stats. Create custom agents for Scale clients.

5. **Billing Dashboard** — MRR chart, upcoming renewals, failed payments, invoice history. Links to Stripe Dashboard for deep management.

6. **Analytics** — Turnaround time trends, client satisfaction scores, agent performance comparison, SLA compliance rate.

### 5.4 Agent Monitoring

Already partially built. Extend with:

```typescript
// Real-time agent status panel
const AgentMonitor = () => {
  const agents = useQuery(api.agents.list);
  const activeTasks = useQuery(api.tasks.byStatus, { status: "running" });

  return (
    <div>
      {agents?.map(agent => {
        const agentTasks = activeTasks?.filter(t => t.assignedAgentId === agent._id);
        return (
          <AgentCard
            key={agent._id}
            agent={agent}
            activeTasks={agentTasks}
            // Show: name, status, current task, model, uptime, performance stats
          />
        );
      })}
    </div>
  );
};
```

---

## 6. DevOps & Infrastructure

### 6.1 Deployment Strategy — Hybrid

| Component | Deploy To | Why |
|-----------|-----------|-----|
| `apps/landing` | **Vercel** | Static-ish marketing site, perfect for Vercel's edge. Free tier works. |
| `apps/dashboard` | **Vercel** | Next.js + Convex, Vercel is the natural home. Use Pro plan ($20/mo) for team features. |
| Convex backend | **Convex Cloud** | Managed. No infrastructure to manage. Pro plan ($25/mo) for production. |
| OpenClaw Gateway | **VPS (current)** | Already running on your Hetzner VPS. Keep it here. It needs persistent WebSocket connections and file system access. |
| Slack/Discord Bot | **VPS (sidecar)** | Run alongside OpenClaw. Or as a Convex HTTP action if lightweight enough. |

**Domain setup:**
- `bullpen.agency` (or `.dev` / `.ai`) — landing page
- `app.bullpen.agency` — dashboard
- `api.bullpen.agency` — Convex HTTP actions (auto-provided by Convex)

### 6.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Bullpen

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build  # Type checking happens during build

  deploy-convex:
    needs: lint-and-type-check
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: npx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}

  deploy-landing:
    needs: lint-and-type-check
    if: github.ref == 'refs/heads/main'
    # Vercel auto-deploys from GitHub — this is just for tracking
    runs-on: ubuntu-latest
    steps:
      - run: echo "Vercel handles deployment via GitHub integration"

  deploy-dashboard:
    needs: [lint-and-type-check, deploy-convex]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Vercel handles deployment via GitHub integration"
      # Convex deploys first so schema changes are live before new frontend
```

**PR Preview:**
- Vercel Preview Deployments for frontend changes (automatic)
- Convex Preview Deployments for backend changes (`npx convex dev --preview`)

### 6.3 Environment Management

| Environment | Landing URL | Dashboard URL | Convex | OpenClaw |
|-------------|-------------|---------------|--------|----------|
| **dev** | `localhost:3004` | `localhost:3001` | `dev:bullpen-xxx` | `ws://localhost:18789` |
| **preview** | `*.vercel.app` | `*.vercel.app` | `preview:bullpen-xxx` | Dev gateway |
| **production** | `bullpen.agency` | `app.bullpen.agency` | `prod:bullpen-xxx` | Production gateway |

**Environment variables (production):**

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://bullpen-prod.convex.cloud
CONVEX_DEPLOY_KEY=prod:xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_SPRINT=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_SCALE=price_xxx

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_JWT_ISSUER_DOMAIN=https://xxx.clerk.accounts.dev

# OpenClaw
OPENCLAW_GATEWAY_URL=ws://your-vps-ip:18789
OPENCLAW_GATEWAY_TOKEN=xxx
OPENCLAW_API_URL=http://your-vps-ip:18789

# Email
RESEND_API_KEY=re_xxx

# Slack
SLACK_BOT_TOKEN=xoxb-xxx
SLACK_SIGNING_SECRET=xxx

# Domain
NEXT_PUBLIC_APP_URL=https://app.bullpen.agency
NEXT_PUBLIC_LANDING_URL=https://bullpen.agency
BULLPEN_WEBHOOK_URL=https://app.bullpen.agency
```

### 6.4 Monitoring and Alerting

**Layer 1: Application (Sentry)**
- Capture frontend errors in both landing + dashboard
- Capture Convex function errors (Sentry Node SDK in Convex actions)
- Alert on: error rate spike, new error types
- $0 on developer plan (5k events/mo)

**Layer 2: Infrastructure**
- Vercel: built-in analytics + function logs
- Convex: built-in dashboard with function execution logs, hot/slow queries
- VPS (OpenClaw): simple uptime check via UptimeRobot (free)

**Layer 3: Business (Custom)**
- SLA breach alert → Slack/Discord notification to operator
- Payment failure → email to operator + client
- Agent failure rate > 20% → Slack alert
- No activity for 2+ hours during business hours → Slack alert

### 6.5 Backup Strategy

| Data | Backup Method | Frequency | Retention |
|------|--------------|-----------|-----------|
| Convex DB | Convex built-in snapshots | Continuous | 30 days (Pro plan) |
| Convex Files | Convex built-in | With DB snapshots | 30 days |
| OpenClaw workspaces | VPS snapshot (Hetzner) | Weekly | 4 weeks |
| Git repo | GitHub | Every push | Unlimited |
| Stripe data | Stripe's infrastructure | N/A | Stripe manages |
| Clerk data | Clerk's infrastructure | N/A | Clerk manages |

**Point-in-time recovery:** Convex Pro supports import/export. Monthly export to S3/GCS for disaster recovery beyond 30 days.

### 6.6 Security Considerations

**Authentication:**
- All dashboard endpoints behind Clerk auth
- Convex functions check auth identity before data access
- Client can only see their own data (enforced at query level, not just UI)
- Operator check against allowlisted Clerk user IDs

**API Security:**
- Webhook endpoints validate signatures (Stripe webhook sig, custom HMAC for OpenClaw webhooks)
- Rate limiting on public endpoints (Vercel Edge Middleware or Convex rate limiting)
- OpenClaw Gateway requires token authentication

**Data Security:**
- No PII in logs
- Stripe handles all payment data (PCI compliance via Stripe)
- File storage uses signed URLs with expiration
- HTTPS everywhere (Vercel + Convex enforce this)

**Operational Security:**
- Principle of least privilege for API keys
- Rotate secrets quarterly
- Environment variables never in code (use Vercel/Convex env var management)
- VPS hardened: SSH key auth only, fail2ban, ufw

---

## 7. MVP Roadmap

### 7.1 What to Build FIRST (Week 1-3) — "Accept a Paying Client"

**Goal:** Accept a Sprint client ($2,500), deliver one project, get paid.

**MVP Feature Set:**

| Feature | Priority | Est. Effort |
|---------|----------|-------------|
| Stripe Checkout (Sprint plan only) | P0 | 1 day |
| Clerk auth (operator only — clients wait) | P0 | 1 day |
| Enhanced project creation (from brief) | P0 | 1 day |
| Task decomposition (operator breaks project into tasks) | P0 | Already exists |
| Agent dispatch (already works) | P0 | Already exists |
| Review queue (approve/reject deliverables) | P0 | 2 days |
| Deliverable delivery (email + download link) | P0 | 1 day |
| Basic Resend email integration (welcome + delivery) | P0 | 1 day |
| Stripe webhook handling (payment → client created) | P0 | 1 day |
| SLA tracking (simple: just deadline awareness) | P1 | 1 day |
| File upload for deliverables | P1 | 1 day |

**What you DON'T need for MVP:**
- Client portal (deliver via email + download link)
- Slack/Discord integration (communicate manually)
- Analytics dashboard
- Auto-dispatch / queue processing
- Custom agents
- Revision automation (handle manually)
- Subscription management (just Sprint one-time)

**MVP Timeline: ~2-3 weeks** (solo developer, working daily)

```
Week 1: Payment + Auth
├── Day 1-2: Stripe setup (products, checkout, webhooks)
├── Day 3: Clerk auth setup (operator login)
├── Day 4: Client auto-creation from Stripe checkout
└── Day 5: Landing page CTA → Stripe → onboarding flow

Week 2: Delivery Pipeline
├── Day 1-2: Review queue UI (approve/reject deliverables)
├── Day 3: Deliverable file storage (Convex files)
├── Day 4: Email notifications (Resend — welcome + delivery)
└── Day 5: Client download page (public link with auth token)

Week 3: Polish + Testing
├── Day 1-2: End-to-end testing (signup → project → delivery)
├── Day 3: SLA deadline tracking + operator alerts
├── Day 4: Error handling, edge cases, logging
└── Day 5: Deploy to production, domain setup
```

### 7.2 What Comes in V2 (Week 4-8) — "Sustain Pro Clients"

| Feature | Why Now |
|---------|---------|
| Client portal (full) | Pro clients need self-service project tracking |
| Subscription billing (Pro plan) | Recurring revenue |
| Client communication (in-portal messaging) | Reduce manual back-and-forth |
| Slack/Discord integration | Pro clients expect dedicated channels |
| Deliverable versioning + revision workflow | Automated revision loop |
| Usage tracking (deliverables/month) | Enforce Pro plan limits |
| Analytics dashboard (basic) | Know your numbers |
| Cal.com integration | Weekly strategy calls for Pro |
| Agent performance tracking | Optimize agent routing |
| Auto-dispatch queue | Less manual work |

### 7.3 V3 and Beyond (Week 9+) — "Scale Tier + Growth"

| Feature | Why Later |
|---------|-----------|
| Custom agent configs (Scale) | Need Scale clients first |
| Knowledge base / RAG | Complex, needs Scale demand |
| White-label delivery | Scale feature, can fake with branding for now |
| Multi-operator support | When you hire people |
| API for client integrations | When Scale clients ask |
| Advanced analytics (PostHog) | When you have enough data |
| Automated project decomposition (AI) | Agent plans its own task breakdown |
| Client satisfaction surveys | After 10+ deliveries |

---

## 8. Open Questions / Risks

### 8.1 Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **OpenClaw Gateway is a single point of failure** | HIGH | It runs on one VPS. If it goes down, no agents work. Mitigation: health checks, auto-restart (PM2), VPS snapshot backups. Long-term: containerize, consider multi-node. |
| **Agent quality inconsistency** | HIGH | AI output varies. A bad deliverable shipped to a $2,500 client kills trust. Mitigation: Mandatory human QA on everything. Never auto-deliver. Build review into the process. |
| **Convex cold starts** | LOW | Convex functions have minimal cold starts, but actions calling external APIs (Stripe, OpenClaw) might timeout. Mitigation: Retry logic, generous timeouts. |
| **WebSocket connection stability** | MEDIUM | The OpenClaw client uses WebSocket. Long-running connections can drop. Mitigation: Auto-reconnect logic (partially implemented), heartbeats. Consider HTTP API for critical dispatch paths (already suggested in dispatcher). |
| **File size limits** | LOW | Convex files have a 50MB per-file limit. Most deliverables are fine. For large assets (video, huge design files): link to external storage (Figma, Google Drive, S3). |
| **Prompt injection via client briefs** | MEDIUM | A malicious client could put adversarial text in their brief that makes agents behave unexpectedly. Mitigation: Sanitize briefs, separate system prompt from client input clearly in agent prompts. |

### 8.2 Business Model Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Underpricing Sprint at $2,500** | HIGH | If a project takes 20+ human hours of QA/revision, you're losing money. Track time rigorously from day 1. Know your cost per deliverable. Be ready to adjust pricing. |
| **Scope creep on Sprint** | HIGH | "One deliverable" is vague. Client says "landing page" then wants 15 pages. Mitigation: Crystal-clear scope definition in intake. Written agreement on what's included. Hard limit on revision rounds (2). |
| **Pro plan churn** | MEDIUM | $4,500/mo is a lot. Client needs to see consistent value. Mitigation: Weekly strategy calls, proactive suggestions, show ROI in monthly reports. |
| **Scale plan delivery capacity** | HIGH | "Unlimited deliverables" is dangerous. One Scale client could theoretically submit 50 projects. Mitigation: "Unlimited" means reasonable usage, not literally infinite. Define in terms — e.g., "one active project at a time, unlimited deliverables within." SLA governs actual throughput. |
| **AI cost per project** | MEDIUM | Claude Opus isn't cheap. A complex project could burn $20-50 in API calls. At $2,500, that's fine. But track it. Mitigation: Use cheaper models (Cerebras, Haiku) for research/simple tasks. Reserve Opus for complex work. |
| **Single operator bottleneck** | HIGH | Everything funnels through you for QA. At 5+ Pro clients, that's 20+ deliverables/month needing review. You become the bottleneck. Mitigation: Build robust review tools that make QA fast (inline diff, one-click approve). Long-term: hire junior QA. |

### 8.3 Scalability Concerns

| Concern | When It Matters | Plan |
|---------|----------------|------|
| **Convex limits** | 100+ concurrent users, millions of rows | Convex scales well. Move to Convex Pro for larger document limits. Their infra is built for this. |
| **OpenClaw concurrent agents** | 10+ simultaneous agent sessions | Single VPS will hit memory limits. Solution: Upgrade VPS (4GB → 16GB RAM), or run agents on separate nodes. OpenClaw supports distributed sessions. |
| **Dashboard performance** | 50+ projects, 500+ tasks | Use Convex pagination (`.paginate()`). Add archival (move old projects to cold storage). Index everything. |
| **Event log growth** | Thousands of events per day | Already have `events.cleanup` mutation. Run daily via cron to prune events older than 30 days. Keep aggregated stats separately. |
| **File storage** | 10GB+ of deliverables | Convex Pro handles 50GB. Beyond that, migrate large files to S3/R2 and store URLs in Convex. |

### 8.4 Open Design Decisions

1. **Should the client portal be a separate app or part of `apps/dashboard`?**
   - **Recommendation:** Same app, different route groups with auth-based routing. Saves build/deploy complexity. Use Clerk's `getAuth()` to determine role.

2. **Should we use Convex HTTP actions or Next.js API routes for webhooks?**
   - **Recommendation:** Migrate to Convex HTTP actions for everything except the OpenClaw WebSocket proxy. Convex HTTP actions are serverless, auto-scale, and can directly mutate the database without an HTTP client.

3. **How do we handle the Sprint → ongoing client conversion?**
   - **Recommendation:** After Sprint delivery, send a "How did we do?" email with upsell to Pro. Track conversion rate. Make it easy to upgrade in the client portal.

4. **Do we need a separate staging Convex deployment?**
   - **Recommendation:** Yes. Use Convex's preview deployments for PR branches and a dedicated staging deployment for integration testing. Production is sacred.

5. **OpenClaw Gateway: keep on VPS or move to container orchestration?**
   - **Recommendation:** Keep on VPS for now. Containerize (Docker) for easier deployment and backup. Don't go Kubernetes yet — overkill for this stage. Revisit at 10+ concurrent agent sessions.

---

## Appendix A: Recommended Package Additions

```json
// apps/dashboard/package.json — new dependencies
{
  "dependencies": {
    "@clerk/nextjs": "^6.x",         // Authentication
    "stripe": "^17.x",              // Stripe SDK (server-side)
    "resend": "^4.x",               // Email
    "@slack/bolt": "^4.x",          // Slack bot (optional, v2)
    "date-fns": "^4.x",             // Date utilities
    "recharts": "^2.x",             // Analytics charts
    "react-hot-toast": "^2.x"       // Better toast notifications
  }
}
```

```json
// apps/landing/package.json — new dependencies
{
  "dependencies": {
    "stripe": "^17.x"               // Stripe Checkout (server-side)
  }
}
```

## Appendix B: Full Revised Schema (single file)

The complete schema incorporating all changes above lives in the schema evolution section (2.2-2.3). Copy those table definitions into `apps/dashboard/convex/schema.ts` incrementally as each feature is built.

## Appendix C: Environment Variables Checklist

```bash
# === REQUIRED FOR MVP ===
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_SPRINT=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENCLAW_GATEWAY_URL=
OPENCLAW_GATEWAY_TOKEN=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_LANDING_URL=
BULLPEN_WEBHOOK_URL=
OPERATOR_CLERK_ID=

# === REQUIRED FOR V2 ===
STRIPE_PRICE_PRO=
STRIPE_PRICE_SCALE=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=

# === OPTIONAL ===
SENTRY_DSN=
POSTHOG_API_KEY=
CALCOM_API_KEY=
```

---

*This plan is opinionated by design. Not every decision is the only right answer, but every decision is defensible and optimized for shipping fast while building a real business. The priority is: get paid, deliver quality, iterate.*

---

# Part 2: Codebase Technical Audit

# Bullpen Codebase Technical Audit

Date: 2026-02-06  
Workspace audited: `/home/mihbot/bullpen`

## 0) Scope and path resolution

The requested root paths do not exist as top-level directories in this repo:
- `convex/schema.ts` (not at repo root)
- `convex/*.ts` (not at repo root)
- `src/app/api/` (not at repo root)
- `src/lib/` (not at repo root)

Equivalent implementation paths are inside `apps/dashboard`:
- `apps/dashboard/convex/schema.ts`
- `apps/dashboard/convex/*.ts`
- `apps/dashboard/src/app/api/**`
- `apps/dashboard/src/lib/**`

I audited those equivalents plus the explicitly requested monorepo/config/apps/hook areas.

---

## 1) Monorepo and dependency inventory

## 1.1 Workspace layout

From `pnpm-workspace.yaml`:
- Workspaces: `apps/*`, `packages/*`
- `packages/ui` directory exists but is empty (no package files)

Top-level applications:
- `apps/dashboard` (Next.js + Convex + OpenClaw dashboard)
- `apps/landing` (marketing/landing Next.js site)

## 1.2 Root package (`package.json`)

Scripts:
- `dev`: runs `@bullpen/landing` (`next dev --port 3004`)
- `dev:dashboard`: runs `@bullpen/dashboard` (`next dev --port 3001`)
- `dev:all`: parallel dev for apps
- `build`, `lint`: filter all apps

Root dev dependency:
- `turbo` (declared `^2.5.4`, resolved `2.8.3` in lockfile)

## 1.3 App dependency snapshots

### `apps/dashboard/package.json`
Runtime deps:
- `next@16.1.6`
- `react@19.2.3`, `react-dom@19.2.3`
- `convex@^1.31.7` (resolved `1.31.7`)
- `lucide-react@^0.563.0`
- `clsx@^2.1.1`
- `tailwind-merge@^3.4.0`

Dev deps:
- `typescript@^5` (resolved `5.9.3`)
- `eslint@^9` + `eslint-config-next@16.1.6`
- `tailwindcss@^4`, `@tailwindcss/postcss@^4`
- `@types/node`, `@types/react`, `@types/react-dom`

### `apps/landing/package.json`
Runtime deps:
- same core stack as dashboard, plus `framer-motion@^12.12.1` (resolved `12.31.0`)

Dev deps:
- same lint/ts/tailwind toolchain as dashboard

## 1.4 What is missing for production at monorepo level

- No CI config in repo (no GitHub Actions/workflow files observed).
- No Turbo pipeline config file (`turbo.json` absent).
- No automated tests (unit/integration/e2e) present.
- No shared package implementation despite `packages/*` workspace inclusion.
- Root `dev` script launches landing, while README quick start describes dashboard workflow; developer onboarding is inconsistent.

---

## 2) Config file inventory

Config files found (source-controlled):
- Root: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.env.example`
- Dashboard: `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `next-env.d.ts`
- Landing: `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `next-env.d.ts`

Not found:
- `convex.json`
- `turbo.json`
- `tailwind.config.*`

## 2.1 Config behavior and implications

### `apps/dashboard/next.config.ts`
- `assetPrefix: "/bullpen"`
- `allowedDevOrigins` includes one Tailscale URL

Implication:
- Dashboard assets are coupled to `/bullpen` prefixing assumptions.
- Good for reverse-proxy prefix setups, but can complicate standard deployment patterns if not matched by infra.

### `apps/landing/next.config.ts`
- `reactStrictMode: true`

### `.env.example`
Contains:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `OPENCLAW_GATEWAY_URL`
- `OPENCLAW_GATEWAY_TOKEN`

Missing from `.env.example` but used in code:
- `BULLPEN_WEBHOOK_URL`

### `.gitignore`
- Properly ignores `.next`, `node_modules`, `.env*`, tsbuildinfo.

## 2.2 Build/lint/typecheck audit findings

Commands run:
- `pnpm --filter @bullpen/dashboard lint` -> passes with warnings
- `pnpm --filter @bullpen/landing lint` -> fails (no `eslint.config.*` in landing app)
- `pnpm --filter @bullpen/dashboard exec tsc --noEmit` -> pass
- `pnpm --filter @bullpen/landing exec tsc --noEmit` -> pass
- `pnpm --filter @bullpen/dashboard build` -> fails in this environment (Google Font fetch blocked)
- `pnpm --filter @bullpen/landing build` -> fails in this environment (Turbopack internal error while spawning process / binding port)

Additional Next warning in both builds:
- Next inferred workspace root from `/home/mihbot/package-lock.json` (outside repo), indicating lockfile ambiguity in host environment.

Production implication:
- Landing lint is definitely misconfigured as committed.
- Build reproducibility may be environment-dependent; dashboard also depends on external font fetch during build.

---

## 3) Convex database and function inventory (`apps/dashboard/convex`)

## 3.1 Schema (`apps/dashboard/convex/schema.ts`)

Tables defined:
1. `clients`
2. `projects`
3. `agents`
4. `tasks`
5. `deliverables`
6. `events`
7. `messages`

Indexes are present on most query dimensions (status/date/foreign keys/session).

Data model notes:
- Broad use of optional `metadata: v.any()` fields (flexible but weakly typed).
- No explicit uniqueness enforcement for values like `clients.email` or `agents.sessionKey`.
- Lifecycle timestamps are number-based epoch millis.

## 3.2 Function modules and totals

Function files:
- `agents.ts`, `clients.ts`, `deliverables.ts`, `events.ts`, `messages.ts`, `projects.ts`, `tasks.ts`

Totals:
- Queries: 27
- Mutations: 31
- Actions: 0
- Internal functions: 0
- Scheduled/cron jobs: 0

Generated Convex client/type files exist in `apps/dashboard/convex/_generated` and include all above modules.

## 3.3 File-by-file status

### `agents.ts`
What exists:
- Full CRUD-ish operations plus `online`, `heartbeat`, `linkSession`, `unlinkSession`, `bySession`.

Functional vs stubbed:
- Functional for core registry and status changes.
- Session linking is implemented.

Gaps:
- No uniqueness check on `sessionKey` link operation.
- No auth/authorization on mutations.

### `clients.ts`
What exists:
- List/get/active/create/update/remove/withProjects.

Functional vs stubbed:
- Implemented backend logic.
- Not used by dashboard UI/API currently.

Gaps:
- No uniqueness check for `email` despite `by_email` index.
- Deletes do not cascade; possible orphaned `projects`.

### `projects.ts`
What exists:
- List/get/byClient/active/create/updateStatus/update/remove/withDetails.

Functional vs stubbed:
- Backend logic implemented.
- Not wired into current dashboard UI/API.

Gaps:
- Delete does not cascade into `tasks`/`deliverables`.

### `tasks.ts`
What exists:
- Core task lifecycle (create/assign/start/complete/fail/remove) and list/get/filter queries.

Functional vs stubbed:
- This is actively used by UI and API routes.

Gaps:
- No state-machine validation (e.g., assign/start/complete allowed from any prior state).
- No idempotency guards for duplicate complete/fail calls.

### `events.ts`
What exists:
- Feed queries and event creation/cleanup mutation.

Functional vs stubbed:
- Used by UI feed and API logging.

Gaps:
- `cleanup` exists but is not scheduled/invoked anywhere.

### `messages.ts`
What exists:
- Agent conversation/broadcast/send/markRead/unreadCount.

Functional vs stubbed:
- Implemented backend logic.
- Not wired into UI/API currently (roadmap feature).

Gaps:
- No pagination beyond fixed-limit patterns.

### `deliverables.ts`
What exists:
- Full lifecycle: create, review, approve/reject, deliver, update, remove.

Functional vs stubbed:
- Implemented backend logic.
- Not wired into current dashboard UI/API.

Gaps:
- No explicit relation integrity checks beyond project existence on create.

### `_generated/*`
What exists:
- Convex-generated API/type/server helpers.

Functional vs stubbed:
- Generated infrastructure; functional.

Gaps:
- Lint noise from generated files (warnings only).

## 3.4 Convex production gaps

- No auth model (all exported functions are public Convex functions).
- No access control/multi-tenant boundaries.
- No migration/versioning strategy documented.
- No background workers/schedulers for maintenance jobs (event cleanup unused).
- Several domains are backend-complete but not product-integrated (clients/projects/deliverables/messages).

---

## 4) API route inventory (`apps/dashboard/src/app/api`)

Routes audited: 10 files, GET/POST handlers only.

## 4.1 Route-level inventory

### `agents/sync/route.ts`
What exists:
- POST syncs agent status against active OpenClaw sessions.
- GET returns endpoint metadata.

Functional vs stubbed:
- Functional and used by dashboard refresh button/shortcut.

Gaps:
- Comment says online/busy mapping, implementation only sets `online`/`offline`.
- Sequential per-agent updates (could be slow at scale).
- No auth/rate limiting.

### `openclaw/sessions/route.ts`
- GET lists sessions via gateway.
- Functional proxy.
- No auth.

### `openclaw/sessions/[key]/history/route.ts`
- GET fetches `chat.history` for session.
- Functional proxy.
- No auth.

### `openclaw/sessions/[key]/send/route.ts`
- POST sends message to a session.
- Functional proxy.
- No auth, minimal validation.

### `openclaw/status/route.ts`
- GET gateway status via RPC.
- Functional.
- Not used by current UI.

### `status/route.ts`
- GET service health summary.

Gap:
- Advertises `/api/tasks` endpoint in response, but no such route exists.

### `tasks/[id]/dispatch/route.ts`
What exists:
- Dispatches assigned task by spawning isolated OpenClaw session (`sessions.spawn`).
- Builds long task prompt with embedded curl webhook instructions.
- Marks task running and logs event.

Functional vs stubbed:
- Core dispatch flow is implemented and used by task board.

Gaps:
- `BULLPEN_WEBHOOK_URL` semantics inconsistent:
  - Hook code treats it as base URL.
  - Dispatch route treats it as full webhook endpoint when env is set.
- No auth/rate-limit.
- Prompt-based curl reporting is brittle (string escaping / partial outputs).
- No cryptographic verification for callback authenticity.

### `tasks/[id]/complete/route.ts`
- POST marks task complete or failed.
- Functional and used by task detail manual completion flow.

Gap:
- No auth.

### `webhooks/task-result/route.ts`
What exists:
- External POST webhook for task completion/failure.
- Validates basic fields, updates task, logs event.
- GET self-doc endpoint.

Functional vs stubbed:
- Functional and central to async task completion.

Gaps:
- No webhook signing/secret verification.
- No idempotency keys/replay protection.

### `webhooks/agent-event/route.ts`
What exists:
- External POST webhook for lifecycle events (`command:new`, etc.).
- Attempts agent lookup by `sessionKey`, updates status, logs mapped event type.
- GET self-doc endpoint.

Functional vs stubbed:
- Functional and connected to hook system.

Gaps:
- No auth/signature/replay protection.
- Agent lookup is O(n) via `api.agents.list` + find, instead of using `bySession` query.

## 4.2 API production gaps

- No authentication/authorization on any route.
- No explicit rate-limiting.
- No structured validation library (`zod`/schema) for request payloads.
- No observability hooks (request IDs, tracing, metrics).
- No retry strategy for transient gateway/Convex failures.

---

## 5) Utility library inventory (`src/lib` equivalents)

## 5.1 Dashboard libs (`apps/dashboard/src/lib`)

### `convex.tsx`
- Global `ConvexReactClient` and provider wrapper.
- Functional.
- Uses non-null assertion on `NEXT_PUBLIC_CONVEX_URL` (no startup guard).

### `openclaw/client.ts`
- Core OpenClaw integration (details in section 8).
- Functional implementation with challenge-response auth and RPC call abstraction.

### `openclaw/index.ts`
- Barrel re-export.

### `utils.ts`
- `cn` helper and time formatting functions.
- Functional.

## 5.2 Landing lib (`apps/landing/src/lib/utils.ts`)
- `cn` helper only.

## 5.3 Production gaps in libs

- No centralized config/env validation module.
- No shared logging abstraction.
- OpenClaw client has no explicit reconnect/backoff strategy beyond ad-hoc reconnect-on-demand.

---

## 6) `apps/dashboard` structure and status

## 6.1 Structure summary

- `convex/`: schema + 7 function modules + generated API/types
- `src/app`: dashboard page + API routes
- `src/components/dashboard`: task/agent/feed/session UI components
- `src/components/ui`: `card` and `status-badge`
- `src/lib`: Convex/OpenClaw/utils

## 6.2 Functional areas in use now

Active in page/API wiring:
- Agents (`api.agents.*` limited subset)
- Tasks (`api.tasks.*` limited subset)
- Events feed (`api.events.recent`)
- OpenClaw session messaging from agent detail modal
- Dispatch flow + webhook completion

## 6.3 Present but currently unused/partially integrated

- `SessionDetail` component exists but is not imported anywhere.
- `Card` and `StatusBadge` UI components are not used.
- `StatusBadge` references CSS classes (`status-standby`, `status-working`, `animate-pulse-soft`) not defined in current dashboard CSS.
- Convex modules `clients`, `projects`, `deliverables`, `messages` are implemented but not connected to UI/API entry flows.

## 6.4 Missing for production dashboard

- Auth/session management for dashboard users.
- RBAC / tenant isolation.
- Pagination/virtualization for large task/event lists.
- Reliability controls for dispatch/webhook lifecycle (idempotency, retries, dead-letter behavior).
- Better state machine enforcement for task transitions.

---

## 7) `apps/landing` structure and status

## 7.1 Structure summary

- App router with one marketing page composed from section components.
- Styling via global Tailwind + custom CSS design system.
- Uses `framer-motion` heavily.

## 7.2 Functional vs stubbed

Functional:
- Visual sections renderable: navbar, hero, logo cloud, features, process, testimonials, pricing, FAQ, CTA, footer.

Stubbed/partial:
- CTA form has no submit handler/backend integration (pure static inputs/button).
- `Services`, `BackToTop`, and `ScrollProgress` components exist but are not rendered by `src/app/page.tsx`.

## 7.3 Missing for production landing

- Form submission pipeline (lead capture endpoint, validation, anti-spam, analytics).
- SEO hardening (structured data, canonical strategy, social image assets).
- Lint config missing in app causes `pnpm --filter @bullpen/landing lint` failure.

---

## 8) OpenClaw integration deep dive (`apps/dashboard/src/lib/openclaw` + API usage)

## 8.1 Core implementation

`OpenClawClient` implements:
- Gateway URL/token from env with defaults.
- WebSocket connect flow with challenge-response handshake (`connect.challenge` -> `connect` req).
- RPC request/response map via request IDs.
- 30s per-request timeout.
- Methods:
  - `listSessions()` -> `sessions.list`
  - `getSessionHistory()` -> `chat.history`
  - `sendMessage()` -> `chat.send` with idempotency key
  - `getStatus()` -> `status`
  - `spawnSession()` -> `sessions.spawn`
- Singleton via `getOpenClawClient()`.

## 8.2 Runtime behavior in app

Server API routes use the singleton and call `connect()` opportunistically when needed.

Primary OpenClaw flows:
- Session/status proxy endpoints (`/api/openclaw/*`)
- Agent status sync (`/api/agents/sync`)
- Task dispatch (`/api/tasks/[id]/dispatch` -> `sessions.spawn`)

## 8.3 Strengths

- Clear separation: OpenClaw RPC client vs route handlers.
- Challenge auth implemented, not naive open socket.
- Generic `call()` abstraction keeps methods concise.

## 8.4 Gaps/risks

- No persistent reconnect/backoff loop.
- Pending requests are not explicitly flushed/rejected on disconnect.
- No transport-level metrics/telemetry.
- Strong dependence on runtime globals (`WebSocket`, `crypto`) and gateway protocol assumptions.

---

## 9) Webhook system deep dive (`apps/dashboard/src/app/api/webhooks`)

## 9.1 `task-result` webhook

Input:
- `taskId`, `status` (`completed|failed`), optional `result`/`error`/`agentName`

Behavior:
- Validates minimal payload.
- Loads task.
- Calls `api.tasks.complete` or `api.tasks.fail`.
- Logs event (`task_completed`/`task_failed`) with `via: "webhook"`.

Current quality:
- Functional.
- Missing auth/signature and idempotency.

## 9.2 `agent-event` webhook

Input:
- `type`, `action`, optional `sessionKey`, timestamp/context

Behavior:
- Finds agent by session key (currently by listing all agents then `find`).
- Updates agent status online/offline depending on action.
- Maps event pair to normalized event type and logs it.

Current quality:
- Functional.
- Missing auth/signature.
- Non-scaled lookup path.

## 9.3 End-to-end webhook loop

Dispatch route injects webhook curl instructions into the spawned agent prompt.  
Agents are expected to call `POST /api/webhooks/task-result` when done.

Risk:
- This is prompt-contract based, not protocol-enforced. Misformatted payloads or escaped content issues are likely under real workloads.

---

## 10) Hook system deep dive (`~/.openclaw/hooks/bullpen-sync`)

Audited both:
- Repo copy: `hooks/bullpen-sync/*`
- Installed copy: `/home/mihbot/.openclaw/hooks/bullpen-sync/*`

They are currently identical.

## 10.1 `HOOK.md`

Declares hook metadata:
- Name: `bullpen-sync`
- Events:
  - `command:new`
  - `command:reset`
  - `command:stop`
  - `agent:bootstrap`
  - `gateway:startup`

## 10.2 `handler.ts`

Behavior:
- Builds payload from hook event fields.
- POSTs to `${BULLPEN_WEBHOOK_URL || "http://localhost:3001"}/api/webhooks/agent-event`.
- Logs network/non-200 errors, does not throw.

## 10.3 Operational assessment

Functional:
- Designed for fire-and-forget lifecycle event syncing.

Gaps:
- No retry/backoff queue.
- No signing of webhook payload.
- If dashboard is down, events are dropped.

---

## 11) Functional vs stubbed summary matrix

Functional and actively wired:
- Dashboard UI core: agents/tasks/events (`apps/dashboard/src/app/page.tsx`, task/agent/feed components)
- Convex core used by UI/API: `agents`, `tasks`, `events`
- OpenClaw RPC client + session/history/send/status proxies
- Task dispatch + webhook completion flow
- Hook -> webhook lifecycle event sync

Implemented but not currently wired in product flows:
- Convex domains: `clients`, `projects`, `deliverables`, `messages`
- Dashboard `SessionDetail` component
- Dashboard `ui/card` and `ui/status-badge`
- Landing components: `Services`, `BackToTop`, `ScrollProgress`

Stubbed/static:
- Landing CTA form has no backend action

Broken/misaligned now:
- Landing lint command fails due missing ESLint config in app
- `status` endpoint references `/api/tasks` route that does not exist
- Env docs mismatch around `BULLPEN_WEBHOOK_URL`

---

## 12) Production readiness gaps (prioritized)

1. Security hardening:
- Add auth for dashboard/API routes.
- Add webhook signing/verification + replay protection.
- Add tenant isolation and permission model in Convex/API.

2. Reliability:
- Add idempotency keys for webhook and task transitions.
- Add retries/backoff + dead-letter strategy for hook/webhook/event delivery.
- Formalize task lifecycle state machine constraints.

3. Validation and correctness:
- Add structured request validation (`zod` or equivalent) on all API routes.
- Fix `BULLPEN_WEBHOOK_URL` semantics across hook + dispatch prompt.
- Fix `/api/status` endpoint catalog mismatch.

4. Operations/observability:
- Add CI pipeline (lint/typecheck/build/test).
- Add tracing/log correlation/metrics around dispatch and webhook latency/failures.
- Add scheduled cleanup/job framework for events and stale data.

5. Product integration completeness:
- Either ship or remove dormant modules/components (clients/projects/deliverables/messages/session detail/UI kit).
- Wire landing CTA to real intake endpoint with anti-spam.

6. Developer experience:
- Align README run instructions with actual scripts and app ports.
- Add missing landing lint config.
- Document Convex dev workflow location (`apps/dashboard/convex`) explicitly.

---

## 13) Requested directory-by-directory checklist

### `convex/schema.ts` and `convex/*.ts` (resolved to `apps/dashboard/convex/*`)
- Exists today: full schema + 7 function modules + generated API/types.
- Functional vs stubbed: core agents/tasks/events functional and in-use; clients/projects/deliverables/messages implemented but not product-wired.
- Dependencies: Convex SDK present and configured in dashboard app.
- Missing for prod: auth, uniqueness constraints, lifecycle guardrails, scheduled jobs, tenant boundaries.

### `src/app/api/` (resolved to `apps/dashboard/src/app/api/*`)
- Exists today: 10 route files for sync, OpenClaw proxy, task dispatch/complete, webhooks, status.
- Functional vs stubbed: mostly functional; no obvious TODO stubs; some endpoints unused by UI.
- Dependencies: Next route handlers + Convex HTTP client + OpenClaw client.
- Missing for prod: auth, payload validation, webhook security, rate limiting, stronger idempotency.

### `src/lib/` (resolved to `apps/dashboard/src/lib/*` and `apps/landing/src/lib/*`)
- Exists today: Convex provider, OpenClaw client, utility helpers.
- Functional vs stubbed: functional.
- Dependencies: Convex React SDK, Node/EventEmitter, WebSocket/crypto globals.
- Missing for prod: centralized config validation, retry/reconnect/telemetry robustness.

### `package.json` + `pnpm-workspace.yaml`
- Exists today: monorepo scripts + workspace map.
- Functional vs stubbed: functional scripts, but workflow/docs mismatch.
- Dependencies installed: see sections 1.2 and 1.3.
- Missing for prod: CI/pipeline config, workspace-level build policy (`turbo.json`).

### `apps/dashboard/`
- Exists today: app router dashboard, API routes, Convex backend, componentized UI.
- Functional vs stubbed: core orchestration works; several modules/components are unused.
- Missing for prod: security, multi-tenant controls, reliability and observability enhancements.

### `apps/landing/`
- Exists today: polished multi-section marketing site with motion and custom styling.
- Functional vs stubbed: visuals functional; CTA submission path is stubbed/static.
- Missing for prod: lead pipeline backend, lint config parity, analytics/SEO hardening.

### Config files (`convex.json`, `next.config.ts`, etc.)
- Exists today: Next/PostCSS/TS/ESLint configs per app; no Convex or Turbo root config files.
- Functional vs stubbed: mostly functional; landing lint config missing.
- Missing for prod: consistent lint/build policy, explicit monorepo root config.

### OpenClaw integration (`src/lib/openclaw/`)
- Exists today: dedicated WebSocket RPC client with auth handshake and methods for sessions/history/send/spawn.
- Functional vs stubbed: functional and used in API routes.
- Missing for prod: reconnect/backoff robustness, observability, hardened error recovery.

### Webhook system (`src/app/api/webhooks/`)
- Exists today: `task-result` + `agent-event` POST endpoints with event logging.
- Functional vs stubbed: functional.
- Missing for prod: auth/signing, replay protection, idempotency and queueing.

### Hook system (`~/.openclaw/hooks/bullpen-sync/`)
- Exists today: event subscriptions + handler that POSTs lifecycle events to Bullpen.
- Functional vs stubbed: functional fire-and-forget.
- Missing for prod: retries/backoff, signing, delivery guarantees.

