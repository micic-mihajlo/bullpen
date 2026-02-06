import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all tasks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
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

// Get all tasks with joined agent info
export const withAgent = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").collect();

    return await Promise.all(
      tasks.map(async (task) => {
        const agent = task.assignedAgentId
          ? await ctx.db.get(task.assignedAgentId)
          : null;
        return { ...task, agent };
      })
    );
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

    // Free up the agent
    if (task.assignedAgentId) {
      await ctx.db.patch(task.assignedAgentId, {
        status: "online",
        currentTaskId: undefined,
      });
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

    // Free up the agent
    if (task.assignedAgentId) {
      await ctx.db.patch(task.assignedAgentId, {
        status: "online",
        currentTaskId: undefined,
      });
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
