import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    lastSeen: v.number(), // timestamp
    currentTaskId: v.optional(v.id("tasks")),
    metadata: v.optional(v.any()), // flexible extra data
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"]),

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
    assignedAgentId: v.optional(v.id("agents")),
    priority: v.optional(v.number()), // 1-5, higher = more urgent
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_agent", ["assignedAgentId"])
    .index("by_created", ["createdAt"]),

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
