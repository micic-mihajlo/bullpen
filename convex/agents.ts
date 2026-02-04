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
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      status: "offline",
      soul: args.soul,
      avatar: args.avatar,
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
