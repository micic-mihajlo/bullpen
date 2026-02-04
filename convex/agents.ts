import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
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

// Create a new agent
export const create = mutation({
  args: {
    name: v.string(),
    soul: v.optional(v.string()),
    avatar: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      status: "offline",
      soul: args.soul,
      avatar: args.avatar,
      model: args.model,
      lastSeen: Date.now(),
    });

    // Log creation event
    await ctx.db.insert("events", {
      agentId,
      type: "agent_created",
      message: `Agent "${args.name}" was created`,
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

// Update agent soul/metadata
export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    soul: v.optional(v.string()),
    avatar: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
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
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, {
      sessionKey: args.sessionKey,
      channel: args.channel,
      status: "online",
      lastSeen: Date.now(),
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
