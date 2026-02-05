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
    soul: v.optional(v.string()), // SOUL.md content
    avatar: v.optional(v.string()), // emoji or image URL
    model: v.optional(v.string()), // default model for this agent (e.g., "cerebras/zai-glm-4.7")
    lastSeen: v.number(), // timestamp
    currentTaskId: v.optional(v.id("tasks")),
    metadata: v.optional(v.any()), // flexible extra data
    // OpenClaw integration
    sessionKey: v.optional(v.string()), // linked OpenClaw session
    channel: v.optional(v.string()), // e.g., "discord", "telegram"
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
