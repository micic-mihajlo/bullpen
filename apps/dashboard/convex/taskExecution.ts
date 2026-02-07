import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Dispatch task for agent execution
export const dispatchTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (!task.assignedAgentId) throw new Error("Task not assigned to an agent");

    const agent = await ctx.db.get(task.assignedAgentId);
    if (!agent) throw new Error("Assigned agent not found");

    await ctx.db.patch(args.taskId, {
      status: "running",
      startedAt: Date.now(),
    });

    await ctx.db.insert("events", {
      agentId: task.assignedAgentId,
      type: "task_dispatched",
      message: `Dispatched: "${task.title}"`,
      data: { taskId: args.taskId, agentId: task.assignedAgentId },
      timestamp: Date.now(),
    });

    return { taskId: args.taskId, agentSessionKey: agent.sessionKey };
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

    // Free the agent and update performance metrics
    if (task.assignedAgentId) {
      const agent = await ctx.db.get(task.assignedAgentId);
      if (agent) {
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_agent", (q) => q.eq("assignedAgentId", task.assignedAgentId!))
          .collect();

        const completed = allTasks.filter(
          (t) => t.status === "completed" || t._id === args.taskId
        );
        const failed = allTasks.filter(
          (t) => t.status === "failed" && t._id !== args.taskId
        );

        // If this task failed, count it as failed instead
        const actualCompleted = args.status === "completed" ? completed : completed.filter((t) => t._id !== args.taskId);
        const actualFailed = args.status === "failed" ? [...failed, task] : failed;
        const total = actualCompleted.length + actualFailed.length;

        const durations = actualCompleted
          .filter((t) => t.startedAt && (t.completedAt || t._id === args.taskId))
          .map((t) => (t._id === args.taskId ? Date.now() : t.completedAt!) - t.startedAt!);
        const avgDuration =
          durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;

        await ctx.db.patch(task.assignedAgentId, {
          status: "online",
          currentTaskId: undefined,
          tasksCompleted: actualCompleted.length,
          tasksSuccessRate: total > 0 ? Math.round((actualCompleted.length / total) * 100) : 0,
          avgTaskDurationMs: avgDuration,
        });
      }
    }

    await ctx.db.insert("events", {
      agentId: task.assignedAgentId,
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
