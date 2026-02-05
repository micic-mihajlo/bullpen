import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all projects
export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").order("desc").collect();
    
    // Enrich with client info
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);
        return { ...project, client };
      })
    );
    
    return enriched;
  },
});

// Get project by ID
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;
    
    const client = await ctx.db.get(project.clientId);
    return { ...project, client };
  },
});

// List projects by client
export const byClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

// List active projects
export const active = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);
        return { ...project, client };
      })
    );
    
    return enriched;
  },
});

// Create a new project
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    type: v.string(),
    brief: v.optional(v.string()),
    deadline: v.optional(v.number()),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client not found");

    const projectId = await ctx.db.insert("projects", {
      clientId: args.clientId,
      name: args.name,
      type: args.type,
      brief: args.brief,
      status: "intake",
      deadline: args.deadline,
      budget: args.budget,
      createdAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "project_created",
      message: `New project: "${args.name}" for ${client.name}`,
      data: { projectId, clientId: args.clientId, type: args.type },
      timestamp: Date.now(),
    });

    return projectId;
  },
});

// Update project status
export const updateStatus = mutation({
  args: {
    id: v.id("projects"),
    status: v.union(
      v.literal("intake"),
      v.literal("active"),
      v.literal("review"),
      v.literal("delivered"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "delivered") {
      updates.deliveredAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    await ctx.db.insert("events", {
      type: "project_status_changed",
      message: `Project "${project.name}" → ${args.status}`,
      data: { projectId: args.id, status: args.status },
      timestamp: Date.now(),
    });
  },
});

// Update project
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    brief: v.optional(v.string()),
    deadline: v.optional(v.number()),
    budget: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete project
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("events", {
      type: "project_removed",
      message: `Project removed: ${project.name}`,
      timestamp: Date.now(),
    });
  },
});

// Get project with tasks and deliverables
export const withDetails = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const client = await ctx.db.get(project.clientId);
    
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    return { ...project, client, tasks, deliverables };
  },
});
