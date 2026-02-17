import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function deriveStatusFromSteps(
  steps: Array<{ status: "pending" | "in_progress" | "review" | "approved" | "rejected" }>
): "pending" | "running" | "review" | "completed" {
  if (steps.length > 0 && steps.every((s) => s.status === "approved")) return "completed";
  if (steps.some((s) => s.status === "review" || s.status === "rejected")) return "review";
  if (steps.some((s) => s.status === "in_progress")) return "running";
  return "pending";
}

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
      v.literal("review"),
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

// Get all tasks with joined worker info (bounded)
export const withAgent = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").take(200);

    // Enrich with worker template info if workerId exists
    return await Promise.all(
      tasks.map(async (task) => {
        let agent = null;
        if (task.workerId) {
          const worker = await ctx.db.get(task.workerId);
          if (worker) {
            const template = await ctx.db.get(worker.templateId);
            if (template) {
              agent = {
                _id: template._id,
                name: template.displayName,
                avatar: undefined,
                status: worker.status === "active" ? "busy" : "online",
              };
            }
          }
        }
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

// Get task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;

    let agent = null;
    if (task.workerId) {
      const worker = await ctx.db.get(task.workerId);
      if (worker) {
        const template = await ctx.db.get(worker.templateId);
        if (template) {
          agent = {
            _id: template._id,
            name: template.displayName,
            status: worker.status === "active" ? "busy" : "online",
          };
        }
      }
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
    workerType: v.optional(v.string()),
    steps: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("approved"),
        v.literal("rejected")
      ),
      agentOutput: v.optional(v.string()),
      reviewNote: v.optional(v.string()),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
    }))),
    dependsOn: v.optional(v.array(v.id("tasks"))),
    priorityLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
  },
  handler: async (ctx, args) => {
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
      workerType: args.workerType,
      steps: args.steps,
      currentStep: args.steps ? 0 : undefined,
      dependsOn: args.dependsOn,
      priorityLevel: args.priorityLevel,
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

// Assign task (legacy compat — accepts string agent name)
export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      status: "assigned",
      assignedAgentId: args.agentId,
    });

    await ctx.db.insert("events", {
      type: "task_assigned",
      message: `Task "${task.title}" assigned`,
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

    // If there's a worker, mark it completed
    if (task.workerId) {
      const worker = await ctx.db.get(task.workerId);
      if (worker) {
        await ctx.db.patch(task.workerId, {
          status: "completed",
          completedAt: Date.now(),
          lastActivityAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("events", {
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

    // If there's a worker, mark it failed
    if (task.workerId) {
      const worker = await ctx.db.get(task.workerId);
      if (worker) {
        await ctx.db.patch(task.workerId, {
          status: "failed",
          completedAt: Date.now(),
          lastActivityAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("events", {
      type: "task_failed",
      message: `Failed: "${task.title}" - ${args.error}`,
      data: { taskId: args.id, error: args.error },
      timestamp: Date.now(),
    });
  },
});

// Update steps on a task
export const updateSteps = mutation({
  args: {
    id: v.id("tasks"),
    steps: v.array(v.object({
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("approved"),
        v.literal("rejected")
      ),
      agentOutput: v.optional(v.string()),
      reviewNote: v.optional(v.string()),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
    })),
    currentStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    // Guardrail: terminal tasks should not be mutated by step updates
    if (task.status === "failed") {
      throw new Error("Cannot update steps on failed task");
    }

    const nextStatus = deriveStatusFromSteps(args.steps);

    await ctx.db.patch(args.id, {
      steps: args.steps,
      ...(args.currentStep !== undefined ? { currentStep: args.currentStep } : {}),
      status: nextStatus,
      ...(nextStatus === "completed"
        ? {
            completedAt: task.completedAt ?? Date.now(),
            currentStep: args.steps.length,
            result: task.result ?? "All steps approved",
          }
        : {}),
    });

    if (nextStatus === "completed" && task.status !== "completed") {
      await ctx.db.insert("events", {
        type: "task_completed",
        message: `Completed: "${task.title}" (all steps approved)`,
        data: { taskId: args.id, via: "updateSteps" },
        timestamp: Date.now(),
      });
    }
  },
});

// Review a specific step (approve/reject)
export const reviewStep = mutation({
  args: {
    id: v.id("tasks"),
    stepIndex: v.number(),
    action: v.union(v.literal("approved"), v.literal("rejected")),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    if (!task.steps) throw new Error("Task has no steps");
    if (args.stepIndex < 0 || args.stepIndex >= task.steps.length) {
      throw new Error("Invalid step index");
    }

    const existing = task.steps[args.stepIndex];
    if (existing.status !== "review" && existing.status !== "in_progress") {
      throw new Error(`Step ${args.stepIndex + 1} is not reviewable (status: ${existing.status})`);
    }

    const updatedSteps = [...task.steps];
    updatedSteps[args.stepIndex] = {
      ...updatedSteps[args.stepIndex],
      status: args.action,
      reviewNote: args.reviewNote,
      completedAt: Date.now(),
    };

    // If approved and there's a next step, advance currentStep
    let newCurrentStep = task.currentStep;
    if (args.action === "approved" && args.stepIndex === task.currentStep) {
      newCurrentStep = args.stepIndex + 1;
    }

    const nextStatus = deriveStatusFromSteps(updatedSteps);

    await ctx.db.patch(args.id, {
      steps: updatedSteps,
      currentStep: nextStatus === "completed" ? updatedSteps.length : newCurrentStep,
      status: nextStatus,
      ...(nextStatus === "completed"
        ? {
            completedAt: task.completedAt ?? Date.now(),
            result: task.result ?? "All steps approved",
          }
        : {}),
    });

    // Log as agent message
    await ctx.db.insert("agentMessages", {
      taskId: args.id,
      fromAgent: "orchestrator",
      toAgent: "worker",
      message: args.reviewNote || `Step ${args.stepIndex + 1} ${args.action}`,
      messageType: "step_review",
      stepIndex: args.stepIndex,
      timestamp: Date.now(),
    });

    await ctx.db.insert("events", {
      type: `step_${args.action}`,
      message: `Step "${updatedSteps[args.stepIndex].name}" ${args.action}`,
      data: { taskId: args.id, stepIndex: args.stepIndex },
      timestamp: Date.now(),
    });
  },
});

// Link a worker to a task
export const linkWorker = mutation({
  args: {
    id: v.id("tasks"),
    workerId: v.id("workers"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(args.id, { workerId: args.workerId });
  },
});

// Delete task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
