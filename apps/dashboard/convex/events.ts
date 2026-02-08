import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type EventData = {
  projectId?: Id<"projects">;
  taskId?: Id<"tasks">;
  deliverableId?: Id<"deliverables">;
};

// Get recent events (live feed)
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);

    return await Promise.all(
      events.map(async (event) => {
        const agent = event.agentId ? await ctx.db.get(event.agentId) : null;
        return { ...event, agent };
      })
    );
  },
});

// Get events for a specific project (via project task IDs)
export const byProject = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const [project, tasks, allEvents] = await Promise.all([
      ctx.db.get(args.projectId),
      ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db.query("events").withIndex("by_timestamp").order("desc").collect(),
    ]);

    if (!project) return [];

    const taskIds = new Set<Id<"tasks">>(tasks.map((task) => task._id));
    const limit = args.limit ?? 50;
    const matchingEvents = allEvents.filter((event) => {
      const data = event.data as EventData | undefined;
      return (
        data?.projectId === args.projectId ||
        (data?.taskId !== undefined && taskIds.has(data.taskId))
      );
    });

    return matchingEvents.slice(0, limit);
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

// Delete events older than 30 days
export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const retentionMs = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;
    const oldEvents = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
    }

    return { deleted: oldEvents.length, cutoff };
  },
});
