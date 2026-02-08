import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Dispatch task for execution
export const dispatchTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      status: "running",
      startedAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "task_dispatched",
      message: `Dispatched: "${task.title}"`,
      data: { taskId: args.taskId },
      timestamp: Date.now(),
    });

    return { taskId: args.taskId };
  },
});

// Receive final task result from external execution runtime
export const receiveResult = mutation({
  args: {
    taskId: v.id("tasks"),
    result: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      status: args.status,
      result: args.result,
      error: args.error,
      completedAt: Date.now(),
    });

    let deliverableId;
    if (args.status === "completed") {
      if (!task.projectId) throw new Error("Task has no project; cannot create deliverable");

      deliverableId = await ctx.db.insert("deliverables", {
        projectId: task.projectId,
        taskId: args.taskId,
        title: task.title,
        content: args.result,
        format: "markdown",
        status: "draft",
        createdAt: Date.now(),
      });
    }

    // If there's a worker, update its status
    if (task.workerId) {
      const worker = await ctx.db.get(task.workerId);
      if (worker) {
        await ctx.db.patch(task.workerId, {
          status: args.status === "completed" ? "completed" : "failed",
          completedAt: Date.now(),
          lastActivityAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("events", {
      type: args.status === "completed" ? "task_completed" : "task_failed",
      message:
        args.status === "completed"
          ? `Completed: "${task.title}"`
          : `Failed: "${task.title}"${args.error ? ` - ${args.error}` : ""}`,
      data: {
        taskId: args.taskId,
        result: args.result,
        error: args.error,
        deliverableId,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
