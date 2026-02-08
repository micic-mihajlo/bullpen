import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send an agent message on a task thread
export const send = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgent: v.string(),
    toAgent: v.string(),
    message: v.string(),
    messageType: v.union(
      v.literal("update"),
      v.literal("question"),
      v.literal("decision"),
      v.literal("handoff"),
      v.literal("steering")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    return await ctx.db.insert("agentMessages", {
      taskId: args.taskId,
      fromAgent: args.fromAgent,
      toAgent: args.toAgent,
      message: args.message,
      messageType: args.messageType,
      timestamp: Date.now(),
    });
  },
});

// List messages for a task, ordered by timestamp
export const listByTask = query({
  args: {
    taskId: v.id("tasks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("agentMessages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .take(limit);
  },
});
