import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get recent events (live feed)
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);

    // Enrich with agent info
    const enriched = await Promise.all(
      events.map(async (event) => {
        let agent = null;
        if (event.agentId) {
          agent = await ctx.db.get(event.agentId);
        }
        return { ...event, agent };
      })
    );

    return enriched;
  },
});

// Get events for a specific agent
export const byAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("events")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(limit);
  },
});

// Get events by type
export const byType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .take(limit);
  },
});

// Create a custom event
export const create = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    type: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      agentId: args.agentId,
      type: args.type,
      message: args.message,
      data: args.data,
      timestamp: Date.now(),
    });
  },
});

// Clear old events (cleanup)
export const cleanup = mutation({
  args: { olderThanMs: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const oldEvents = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
    }

    return oldEvents.length;
  },
});
