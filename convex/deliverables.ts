import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all deliverables
export const list = query({
  args: {},
  handler: async (ctx) => {
    const deliverables = await ctx.db.query("deliverables").order("desc").collect();
    
    const enriched = await Promise.all(
      deliverables.map(async (d) => {
        const project = await ctx.db.get(d.projectId);
        const client = project ? await ctx.db.get(project.clientId) : null;
        return { ...d, project, client };
      })
    );
    
    return enriched;
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

// List by project
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

// List pending review
export const pendingReview = query({
  args: {},
  handler: async (ctx) => {
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_status", (q) => q.eq("status", "review"))
      .collect();
    
    const enriched = await Promise.all(
      deliverables.map(async (d) => {
        const project = await ctx.db.get(d.projectId);
        const client = project ? await ctx.db.get(project.clientId) : null;
        return { ...d, project, client };
      })
    );
    
    return enriched;
  },
});

// Create deliverable
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    title: v.string(),
    content: v.string(),
    format: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const deliverableId = await ctx.db.insert("deliverables", {
      projectId: args.projectId,
      taskId: args.taskId,
      title: args.title,
      content: args.content,
      format: args.format,
      status: "draft",
      createdAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "deliverable_created",
      message: `New deliverable: "${args.title}" for ${project.name}`,
      data: { deliverableId, projectId: args.projectId },
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
      data: { deliverableId: args.id },
      timestamp: Date.now(),
    });
  },
});

// Approve deliverable
export const approve = mutation({
  args: {
    id: v.id("deliverables"),
    reviewedBy: v.string(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    await ctx.db.patch(args.id, {
      status: "approved",
      reviewedBy: args.reviewedBy,
      reviewNotes: args.reviewNotes,
    });

    await ctx.db.insert("events", {
      type: "deliverable_approved",
      message: `"${deliverable.title}" approved by ${args.reviewedBy}`,
      data: { deliverableId: args.id },
      timestamp: Date.now(),
    });
  },
});

// Reject deliverable
export const reject = mutation({
  args: {
    id: v.id("deliverables"),
    reviewedBy: v.string(),
    reviewNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) throw new Error("Deliverable not found");

    await ctx.db.patch(args.id, {
      status: "rejected",
      reviewedBy: args.reviewedBy,
      reviewNotes: args.reviewNotes,
    });

    await ctx.db.insert("events", {
      type: "deliverable_rejected",
      message: `"${deliverable.title}" rejected: ${args.reviewNotes}`,
      data: { deliverableId: args.id },
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
      data: { deliverableId: args.id },
      timestamp: Date.now(),
    });
  },
});

// Update content
export const update = mutation({
  args: {
    id: v.id("deliverables"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    format: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
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
      timestamp: Date.now(),
    });
  },
});
