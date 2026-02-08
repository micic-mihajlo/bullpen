import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const skillValidator = v.object({
  name: v.string(),
  category: v.string(),
  level: v.union(
    v.literal("learning"),
    v.literal("proficient"),
    v.literal("expert")
  ),
});

// Get all agents (bounded to prevent runaway reads)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").take(200);
  },
});

// Get agent by ID
export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get online agents
export const online = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "online"))
      .collect();
  },
});

// Get agent with computed metrics from task history
export const getWithMetrics = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) return null;

    // Get all tasks for this agent
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_agent", (q) => q.eq("assignedAgentId", args.id))
      .collect();

    const completed = tasks.filter((t) => t.status === "completed");
    const failed = tasks.filter((t) => t.status === "failed");
    const total = completed.length + failed.length;

    // Compute duration for completed tasks that have timing data
    const durations = completed
      .filter((t) => t.startedAt && t.completedAt)
      .map((t) => t.completedAt! - t.startedAt!);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    return {
      ...agent,
      computedMetrics: {
        totalTasks: tasks.length,
        completedTasks: completed.length,
        failedTasks: failed.length,
        successRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
        avgDurationMs: avgDuration,
        activeTasks: tasks.filter((t) => t.status === "running" || t.status === "assigned").length,
      },
    };
  },
});

// Get recent events for an agent
export const getActivity = query({
  args: { agentId: v.id("agents"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const events = await ctx.db
      .query("events")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(limit);
    return events;
  },
});

// Get task history for an agent
export const getTaskHistory = query({
  args: { agentId: v.id("agents"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_agent", (q) => q.eq("assignedAgentId", args.agentId))
      .order("desc")
      .take(limit);
    return tasks;
  },
});

// Create a new agent (expanded)
export const create = mutation({
  args: {
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.optional(v.string()),
    soul: v.optional(v.string()),
    model: v.optional(v.string()),
    modelFallback: v.optional(v.string()),
    thinkingLevel: v.optional(v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    skills: v.optional(v.array(skillValidator)),
    tags: v.optional(v.array(v.string())),
    toolGroups: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      status: "online",
      avatar: args.avatar,
      role: args.role,
      soul: args.soul,
      model: args.model,
      modelFallback: args.modelFallback,
      thinkingLevel: args.thinkingLevel,
      skills: args.skills,
      tags: args.tags,
      toolGroups: args.toolGroups,
      lastSeen: Date.now(),
      createdAt: Date.now(),
      tasksCompleted: 0,
      tasksSuccessRate: 0,
      avgTaskDurationMs: 0,
    });

    await ctx.db.insert("events", {
      agentId,
      type: "agent_created",
      message: `Agent "${args.name}" was created${args.role ? ` as ${args.role}` : ""}`,
      timestamp: Date.now(),
    });

    return agentId;
  },
});

// Update agent status
export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(
      v.literal("online"),
      v.literal("offline"),
      v.literal("busy")
    ),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      lastSeen: Date.now(),
    });

    await ctx.db.insert("events", {
      agentId: args.id,
      type: "status_change",
      message: `${agent.name} is now ${args.status}`,
      timestamp: Date.now(),
    });
  },
});

// Update agent profile (expanded)
export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(v.string()),
    soul: v.optional(v.string()),
    model: v.optional(v.string()),
    modelFallback: v.optional(v.string()),
    thinkingLevel: v.optional(v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    skills: v.optional(v.array(skillValidator)),
    tags: v.optional(v.array(v.string())),
    toolGroups: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Update agent metrics (called after task completion)
export const updateMetrics = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_agent", (q) => q.eq("assignedAgentId", args.id))
      .collect();

    const completed = tasks.filter((t) => t.status === "completed");
    const failed = tasks.filter((t) => t.status === "failed");
    const total = completed.length + failed.length;

    const durations = completed
      .filter((t) => t.startedAt && t.completedAt)
      .map((t) => t.completedAt! - t.startedAt!);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    await ctx.db.patch(args.id, {
      tasksCompleted: completed.length,
      tasksSuccessRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
      avgTaskDurationMs: avgDuration,
    });
  },
});

// Heartbeat - agent pings to stay online
export const heartbeat = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastSeen: Date.now(),
      status: "online",
    });
  },
});

// Delete agent
export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("events", {
      type: "agent_removed",
      message: `Agent "${agent.name}" was removed`,
      timestamp: Date.now(),
    });
  },
});

// Link agent to OpenClaw session
export const linkSession = mutation({
  args: {
    id: v.id("agents"),
    sessionKey: v.string(),
    channel: v.optional(v.string()),
    openclawId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, {
      sessionKey: args.sessionKey,
      channel: args.channel,
      status: "online" as const,
      lastSeen: Date.now(),
      ...(args.openclawId ? { openclawId: args.openclawId } : {}),
    });

    await ctx.db.insert("events", {
      agentId: args.id,
      type: "session_linked",
      message: `${agent.name} connected to OpenClaw session`,
      data: { sessionKey: args.sessionKey, channel: args.channel },
      timestamp: Date.now(),
    });
  },
});

// Unlink agent from OpenClaw session
export const unlinkSession = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, {
      sessionKey: undefined,
      channel: undefined,
      status: "offline",
    });

    await ctx.db.insert("events", {
      agentId: args.id,
      type: "session_unlinked",
      message: `${agent.name} disconnected from OpenClaw session`,
      timestamp: Date.now(),
    });
  },
});

// Get agent by session key
export const bySession = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_session", (q) => q.eq("sessionKey", args.sessionKey))
      .collect();
    return agents[0] || null;
  },
});

// Smart routing: find best agent for a task based on skills and availability
export const suggestForTask = query({
  args: {
    requiredSkills: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();

    // Score each agent
    const scored = agents.map((agent) => {
      let score = 0;

      // Availability (online and not busy = best)
      if (agent.status === "online") score += 20;
      if (agent.status === "busy") score += 5;
      if (agent.status === "offline") score += 0;

      // Skill match
      if (args.requiredSkills && agent.skills) {
        const agentSkillNames = agent.skills.map((s) => s.name.toLowerCase());
        for (const req of args.requiredSkills) {
          const match = agent.skills.find((s) => s.name.toLowerCase() === req.toLowerCase());
          if (match) {
            score += match.level === "expert" ? 15 : match.level === "proficient" ? 10 : 5;
          }
        }
        // Bonus for having all required skills
        const allMatch = args.requiredSkills.every((r) =>
          agentSkillNames.includes(r.toLowerCase())
        );
        if (allMatch) score += 10;
      }

      // Tag match
      if (args.tags && agent.tags) {
        const agentTags = agent.tags.map((t) => t.toLowerCase());
        for (const tag of args.tags) {
          if (agentTags.includes(tag.toLowerCase())) score += 5;
        }
      }

      // Performance bonus
      const rate = agent.tasksSuccessRate ?? 0;
      score += Math.round(rate / 10); // 0-10 bonus for success rate

      return { agent, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.filter((s) => s.score > 0).slice(0, 5);
  },
});
