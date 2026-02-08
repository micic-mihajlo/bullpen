import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all workers, optionally filter by status
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("spawning"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("workers")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("workers").collect();
  },
});

// Get workers for a specific task
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workers")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Spawn a new worker (create record with status: spawning)
export const spawn = mutation({
  args: {
    templateId: v.id("workerTemplates"),
    taskId: v.id("tasks"),
    sessionKey: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workerId = await ctx.db.insert("workers", {
      templateId: args.templateId,
      taskId: args.taskId,
      sessionKey: args.sessionKey,
      status: "spawning",
      model: args.model,
      spawnedAt: now,
      lastActivityAt: now,
    });

    // Link worker to task
    await ctx.db.patch(args.taskId, { workerId });

    return workerId;
  },
});

// Update worker status
export const updateStatus = mutation({
  args: {
    id: v.id("workers"),
    status: v.union(
      v.literal("spawning"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      lastActivityAt: Date.now(),
    });
  },
});

// Mark worker as completed
export const complete = mutation({
  args: { id: v.id("workers") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: now,
      lastActivityAt: now,
    });
  },
});
