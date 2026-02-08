import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all tasks (bounded)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").take(500);
  },
});

// Get tasks by status
export const byStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get tasks by project
export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

// Get all tasks with joined agent info (bounded, batched agent lookups)
export const withAgent = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").take(200);

    // Batch agent lookups to avoid redundant reads
    const agentIds = [...new Set(tasks.map((t) => t.assignedAgentId).filter(Boolean))];
    const agentMap = new Map<string, { _id: typeof agentIds[0]; name: string; avatar?: string; status: string } | null>();
    await Promise.all(
      agentIds.map(async (id) => {
        if (id) agentMap.set(id, await ctx.db.get(id));
      })
    );

    return tasks.map((task) => ({
      ...task,
      agent: task.assignedAgentId ? agentMap.get(task.assignedAgentId) ?? null : null,
    }));
  },
});

// Get pending tasks (for dispatch)
export const pending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// Get task by ID with agent info
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;

    let agent = null;
    if (task.assignedAgentId) {
      agent = await ctx.db.get(task.assignedAgentId);
    }

    return { ...task, agent };
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    taskType: v.optional(v.union(
      v.literal("coding"),
      v.literal("automation"),
      v.literal("research"),
      v.literal("design"),
      v.literal("review"),
      v.literal("general")
    )),
  },
  handler: async (ctx, args) => {
    // Validate project exists if provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project) throw new Error("Project not found");
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "pending",
      priority: args.priority ?? 3,
      projectId: args.projectId,
      taskType: args.taskType ?? "general",
      createdAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "task_created",
      message: `New task: "${args.title}"`,
      data: { taskId },
      timestamp: Date.now(),
    });

    return taskId;
  },
});

// Assign task to agent
export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    const agent = await ctx.db.get(args.agentId);

    if (!task) throw new Error("Task not found");
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.taskId, {
      status: "assigned",
      assignedAgentId: args.agentId,
    });

    await ctx.db.patch(args.agentId, {
      status: "busy",
      currentTaskId: args.taskId,
    });

    await ctx.db.insert("events", {
      agentId: args.agentId,
      type: "task_assigned",
      message: `${agent.name} was assigned "${task.title}"`,
      data: { taskId: args.taskId },
      timestamp: Date.now(),
    });
  },
});

// Start task execution
export const start = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      status: "running",
      startedAt: Date.now(),
    });

    await ctx.db.insert("events", {
      agentId: task.assignedAgentId,
      type: "task_started",
      message: `Started: "${task.title}"`,
      data: { taskId: args.id },
      timestamp: Date.now(),
    });
  },
});

// Complete task
export const complete = mutation({
  args: {
    id: v.id("tasks"),
    result: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: Date.now(),
      result: args.result,
    });

    // Free up the agent and update metrics
    if (task.assignedAgentId) {
      const agent = await ctx.db.get(task.assignedAgentId);
      if (agent) {
        // Recompute metrics inline
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_agent", (q) => q.eq("assignedAgentId", task.assignedAgentId!))
          .collect();
        // Include this task as completed (it's patched above)
        const completed = allTasks.filter((t) => t.status === "completed" || t._id === args.id);
        const failed = allTasks.filter((t) => t.status === "failed" && t._id !== args.id);
        const total = completed.length + failed.length;
        const durations = completed
          .filter((t) => t.startedAt && (t.completedAt || t._id === args.id))
          .map((t) => (t._id === args.id ? Date.now() : t.completedAt!) - t.startedAt!);
        const avgDuration = durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0;

        await ctx.db.patch(task.assignedAgentId, {
          status: "online",
          currentTaskId: undefined,
          tasksCompleted: completed.length,
          tasksSuccessRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
          avgTaskDurationMs: avgDuration,
        });
      }
    }

    await ctx.db.insert("events", {
      agentId: task.assignedAgentId,
      type: "task_completed",
      message: `Completed: "${task.title}"`,
      data: { taskId: args.id, result: args.result },
      timestamp: Date.now(),
    });
  },
});

// Fail task
export const fail = mutation({
  args: {
    id: v.id("tasks"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      status: "failed",
      completedAt: Date.now(),
      error: args.error,
    });

    // Free up the agent and update metrics
    if (task.assignedAgentId) {
      const agent = await ctx.db.get(task.assignedAgentId);
      if (agent) {
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_agent", (q) => q.eq("assignedAgentId", task.assignedAgentId!))
          .collect();
        const completed = allTasks.filter((t) => t.status === "completed");
        const failed = allTasks.filter((t) => t.status === "failed" || t._id === args.id);
        const total = completed.length + failed.length;

        await ctx.db.patch(task.assignedAgentId, {
          status: "online",
          currentTaskId: undefined,
          tasksCompleted: completed.length,
          tasksSuccessRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
        });
      }
    }

    await ctx.db.insert("events", {
      agentId: task.assignedAgentId,
      type: "task_failed",
      message: `Failed: "${task.title}" - ${args.error}`,
      data: { taskId: args.id, error: args.error },
      timestamp: Date.now(),
    });
  },
});

// Delete task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
