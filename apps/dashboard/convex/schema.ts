import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Clients - who we're doing work for
  clients: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    avatar: v.optional(v.string()), // emoji or image URL
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("churned")
    ),
    plan: v.optional(v.string()), // "starter", "pro", "enterprise"
    channel: v.optional(v.string()), // preferred contact channel
    channelId: v.optional(v.string()), // e.g., WhatsApp number, Slack channel
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Projects - containers for client work
  projects: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    type: v.string(), // "research", "code", "content", "design"
    brief: v.optional(v.string()), // project description/requirements
    status: v.union(
      v.literal("intake"),
      v.literal("active"),
      v.literal("review"),
      v.literal("delivered"),
      v.literal("archived")
    ),
    deadline: v.optional(v.number()),
    budget: v.optional(v.number()), // in cents
    createdAt: v.number(),
    deliveredAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // Agents - the AI workers
  agents: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("offline"),
      v.literal("busy")
    ),
    avatar: v.optional(v.string()),
    role: v.optional(v.string()), // "Researcher", "Developer", etc.

    // Soul — rich markdown personality (SOUL.md content)
    soul: v.optional(v.string()),

    // Structured skills
    skills: v.optional(v.array(v.object({
      name: v.string(),
      category: v.string(), // "technical", "creative", "analytical", "communication"
      level: v.union(
        v.literal("learning"),
        v.literal("proficient"),
        v.literal("expert")
      ),
    }))),

    // Tags for smart task routing
    tags: v.optional(v.array(v.string())),

    // Model configuration
    model: v.optional(v.string()),
    modelFallback: v.optional(v.string()),
    thinkingLevel: v.optional(v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),

    // Tool permissions (OpenClaw tool groups)
    toolGroups: v.optional(v.array(v.string())),

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
    sessionKey: v.optional(v.string()),
    channel: v.optional(v.string()),

    metadata: v.optional(v.any()),
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"])
    .index("by_session", ["sessionKey"]),

  // Tasks - work items for agents
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    taskType: v.optional(v.union(
      v.literal("coding"),
      v.literal("automation"),
      v.literal("research"),
      v.literal("design"),
      v.literal("review"),
      v.literal("general")
    )),
    liveContext: v.optional(v.any()),
    agentThread: v.optional(v.string()),
    projectId: v.optional(v.id("projects")), // link to project (and thus client)
    assignedAgentId: v.optional(v.id("agents")),
    priority: v.optional(v.number()), // 1-5, higher = more urgent
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_project", ["projectId"])
    .index("by_agent", ["assignedAgentId"])
    .index("by_created", ["createdAt"]),

  // Deliverables - polished outputs for clients
  deliverables: defineTable({
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")), // source task, if any
    title: v.string(),
    content: v.string(), // the actual deliverable content
    format: v.string(), // "markdown", "pdf", "code", "figma", "url"
    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("delivered"),
      v.literal("rejected")
    ),
    reviewedBy: v.optional(v.string()), // who approved it
    reviewNotes: v.optional(v.string()),
    createdAt: v.number(),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_task", ["taskId"]),

  // Events - live feed of what's happening
  events: defineTable({
    agentId: v.optional(v.id("agents")),
    type: v.string(), // task_started, task_completed, message, error, heartbeat, etc.
    message: v.string(),
    data: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  // Agent Messages - task-scoped agent communication
  agentMessages: defineTable({
    taskId: v.id("tasks"),
    fromAgent: v.string(),
    toAgent: v.string(), // agent name, "orchestrator", or "all"
    message: v.string(),
    messageType: v.union(
      v.literal("update"),
      v.literal("question"),
      v.literal("decision"),
      v.literal("handoff"),
      v.literal("steering")
    ),
    timestamp: v.number(),
  })
    .index("by_task", ["taskId", "timestamp"]),

  // Messages - agent-to-agent communication
  messages: defineTable({
    fromAgentId: v.id("agents"),
    toAgentId: v.optional(v.id("agents")), // null = broadcast
    content: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
  })
    .index("by_from", ["fromAgentId"])
    .index("by_to", ["toAgentId"])
    .index("by_timestamp", ["timestamp"]),
});
