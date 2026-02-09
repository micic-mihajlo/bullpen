import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all deliverables
export const list = query({
  args: {},
  handler: async (ctx) => {
    const deliverables = await ctx.db.query("deliverables").order("desc").collect();

    return await Promise.all(
      deliverables.map(async (deliverable) => {
        const project = await ctx.db.get(deliverable.projectId);
        const client = project ? await ctx.db.get(project.clientId) : null;
        return { ...deliverable, project, client };
      })
    );
  },
});

// Get deliverable by ID
export const get = query({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) return null;

    const project = await ctx.db.get(deliverable.projectId);
    const client = project ? await ctx.db.get(project.clientId) : null;

    return { ...deliverable, project, client };
  },
});

// Deliverables for a specific project
export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliverables")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

// Deliverables pending operator review
export const pendingReview = query({
  args: {},
  handler: async (ctx) => {
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_status", (q) => q.eq("status", "review"))
      .order("desc")
      .collect();

    return await Promise.all(
      deliverables.map(async (deliverable) => {
        const project = await ctx.db.get(deliverable.projectId);
        const client = project ? await ctx.db.get(project.clientId) : null;
        return { ...deliverable, project, client };
      })
    );
  },
});

// Create deliverable
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    content: v.string(),
    format: v.string(),
    taskId: v.optional(v.id("tasks")),
    artifactType: v.optional(v.union(
      v.literal("repo"),
      v.literal("workflow"),
      v.literal("document"),
      v.literal("files"),
      v.literal("preview")
    )),
    artifactUrl: v.optional(v.string()),
    artifactFiles: v.optional(v.array(v.object({
      name: v.string(),
      path: v.optional(v.string()),
      url: v.optional(v.string()),
      type: v.string(),
    }))),
    setupInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (args.taskId) {
      const task = await ctx.db.get(args.taskId);
      if (!task) throw new Error("Task not found");
      if (task.projectId && task.projectId !== args.projectId) {
        throw new Error("Task does not belong to this project");
      }
    }

    const deliverableId = await ctx.db.insert("deliverables", {
      projectId: args.projectId,
      taskId: args.taskId,
      title: args.title,
      content: args.content,
      format: args.format,
      status: "draft",
      artifactType: args.artifactType,
      artifactUrl: args.artifactUrl,
      artifactFiles: args.artifactFiles,
      setupInstructions: args.setupInstructions,
      createdAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "deliverable_created",
      message: `New deliverable: "${args.title}" for ${project.name}`,
      data: { deliverableId, projectId: args.projectId, taskId: args.taskId },
      timestamp: Date.now(),
    });

    return deliverableId;
  },
});

// Submit for review
export const submitForReview = mutation({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    await ctx.db.patch(args.id, { status: "review" });

    await ctx.db.insert("events", {
      type: "deliverable_submitted",
      message: `"${deliverable.title}" submitted for review`,
      data: {
        deliverableId: args.id,
        projectId: deliverable.projectId,
        taskId: deliverable.taskId,
      },
      timestamp: Date.now(),
    });
  },
});

// Approve deliverable
export const approve = mutation({
  args: {
    id: v.id("deliverables"),
    reviewedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    await ctx.db.patch(args.id, {
      status: "approved",
      reviewedBy: args.reviewedBy,
    });

    await ctx.db.insert("events", {
      type: "deliverable_approved",
      message: `"${deliverable.title}" approved by ${args.reviewedBy}`,
      data: {
        deliverableId: args.id,
        projectId: deliverable.projectId,
        taskId: deliverable.taskId,
        reviewedBy: args.reviewedBy,
      },
      timestamp: Date.now(),
    });
  },
});

// Reject deliverable and send it back to draft
export const reject = mutation({
  args: {
    id: v.id("deliverables"),
    reviewNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    await ctx.db.patch(args.id, {
      status: "draft",
      reviewNotes: args.reviewNotes,
    });

    await ctx.db.insert("events", {
      type: "deliverable_rejected",
      message: `"${deliverable.title}" rejected: ${args.reviewNotes}`,
      data: {
        deliverableId: args.id,
        projectId: deliverable.projectId,
        taskId: deliverable.taskId,
        reviewNotes: args.reviewNotes,
      },
      timestamp: Date.now(),
    });
  },
});

// Mark as delivered
export const deliver = mutation({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    if (deliverable.status !== "approved") {
      throw new Error("Deliverable must be approved before delivery");
    }

    await ctx.db.patch(args.id, {
      status: "delivered",
      deliveredAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "deliverable_delivered",
      message: `"${deliverable.title}" delivered to client`,
      data: {
        deliverableId: args.id,
        projectId: deliverable.projectId,
        taskId: deliverable.taskId,
      },
      timestamp: Date.now(),
    });
  },
});

// Update deliverable content
export const update = mutation({
  args: {
    id: v.id("deliverables"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    format: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("review"),
        v.literal("approved"),
        v.literal("delivered"),
        v.literal("rejected")
      )
    ),
    reviewNotes: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter((entry) => entry[1] !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete deliverable
export const remove = mutation({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("events", {
      type: "deliverable_removed",
      message: `Deliverable removed: ${deliverable.title}`,
      data: { deliverableId: args.id, projectId: deliverable.projectId },
      timestamp: Date.now(),
    });
  },
});
