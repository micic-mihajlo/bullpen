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

  // Worker Templates - pre-configured worker types (replaces agents)
  workerTemplates: defineTable({
    name: v.string(), // e.g. "frontend-builder"
    displayName: v.string(), // e.g. "Frontend Builder"
    role: v.string(), // description of what they do
    taskTypes: v.array(v.string()), // which task types they handle
    model: v.string(), // e.g. "claude-sonnet-4"
    tools: v.array(v.string()),
    skills: v.array(v.string()), // skill file names
    systemPrompt: v.string(),
    reviewEvery: v.number(),
    maxParallel: v.number(),
    status: v.union(v.literal("active"), v.literal("draft")),
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"]),

  // Workers - runtime instances of worker templates
  workers: defineTable({
    templateId: v.id("workerTemplates"),
    taskId: v.id("tasks"),
    sessionKey: v.string(),
    status: v.union(
      v.literal("spawning"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed")
    ),
    model: v.string(),
    spawnedAt: v.number(),
    lastActivityAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_status", ["status"]),

  // Tasks - work items
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("running"),
      v.literal("review"),
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
    projectId: v.optional(v.id("projects")),
    assignedAgentId: v.optional(v.string()), // legacy — kept as string for compat
    priority: v.optional(v.number()), // legacy numeric priority (1-5)

    // New Phase 1 fields
    workerType: v.optional(v.string()),
    workerId: v.optional(v.id("workers")),
    steps: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("approved"),
        v.literal("rejected")
      ),
      agentOutput: v.optional(v.string()),
      reviewNote: v.optional(v.string()),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
    }))),
    currentStep: v.optional(v.number()),
    dependsOn: v.optional(v.array(v.id("tasks"))),
    priorityLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),

    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_project", ["projectId"])
    .index("by_created", ["createdAt"]),

  // Deliverables - polished outputs for clients
  deliverables: defineTable({
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    title: v.string(),
    content: v.string(), // summary/description for display
    format: v.string(), // "markdown", "repo", "workflow", "document", "files"
    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("delivered"),
      v.literal("rejected")
    ),
    // Artifact references — the actual deliverable
    artifactType: v.optional(v.union(
      v.literal("repo"),       // GitHub repository
      v.literal("workflow"),   // n8n workflow JSON
      v.literal("document"),   // Markdown/PDF report
      v.literal("files"),      // Collection of files
      v.literal("preview")     // Live preview URL
    )),
    artifactUrl: v.optional(v.string()),       // primary URL (repo, preview, etc.)
    artifactFiles: v.optional(v.array(v.object({
      name: v.string(),
      path: v.optional(v.string()),
      url: v.optional(v.string()),
      type: v.string(), // "json", "md", "html", etc.
    }))),
    setupInstructions: v.optional(v.string()), // how to use/deploy the deliverable
    reviewedBy: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
    createdAt: v.number(),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_task", ["taskId"]),

  // Events - live feed of what's happening
  events: defineTable({
    agentId: v.optional(v.string()), // legacy — kept as string for compat
    type: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  // Agent Messages - task-scoped agent communication
  agentMessages: defineTable({
    taskId: v.id("tasks"),
    fromAgent: v.string(),
    toAgent: v.string(),
    message: v.string(),
    messageType: v.union(
      v.literal("update"),
      v.literal("question"),
      v.literal("decision"),
      v.literal("handoff"),
      v.literal("steering"),
      v.literal("step_review")
    ),
    stepIndex: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_task", ["taskId", "timestamp"]),

  // Messages - agent-to-agent communication (legacy)
  messages: defineTable({
    fromAgentId: v.string(),
    toAgentId: v.optional(v.string()),
    content: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
  })
    .index("by_from", ["fromAgentId"])
    .index("by_to", ["toAgentId"])
    .index("by_timestamp", ["timestamp"]),
});
