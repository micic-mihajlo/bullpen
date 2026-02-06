import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

type ProjectDetails = Doc<"projects"> & {
  client: Doc<"clients"> | null;
  tasks: Doc<"tasks">[];
  deliverables: Doc<"deliverables">[];
};

const loadProjectDetails = async (
  ctx: QueryCtx,
  id: Id<"projects">
): Promise<ProjectDetails | null> => {
  const project = await ctx.db.get(id);
  if (!project) return null;

  const [client, tasks, deliverables] = await Promise.all([
    ctx.db.get(project.clientId),
    ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .order("desc")
      .collect(),
    ctx.db
      .query("deliverables")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .order("desc")
      .collect(),
  ]);

  return { ...project, client, tasks, deliverables };
};

// List all projects
export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);
        return { ...project, client };
      })
    );
  },
});

// Get project by ID with client, tasks, and deliverables
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => loadProjectDetails(ctx, args.id),
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

    return await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);
        return { ...project, client };
      })
    );
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

    const updates: {
      status:
        | "intake"
        | "active"
        | "review"
        | "delivered"
        | "archived";
      deliveredAt?: number;
    } = { status: args.status };
    if (args.status === "delivered") {
      updates.deliveredAt = Date.now();
    }
    if (args.status !== "delivered") {
      updates.deliveredAt = undefined;
    }

    await ctx.db.patch(args.id, updates);

    await ctx.db.insert("events", {
      type: "project_status_changed",
      message: `Project "${project.name}" -> ${args.status}`,
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
      Object.entries(updates).filter((entry) => entry[1] !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete project with task/deliverable cascade awareness
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    const [tasks, deliverables] = await Promise.all([
      ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.id))
        .collect(),
      ctx.db
        .query("deliverables")
        .withIndex("by_project", (q) => q.eq("projectId", args.id))
        .collect(),
    ]);

    const taskIds = new Set<Id<"tasks">>(tasks.map((task) => task._id));
    const deliverableIds = new Set<Id<"deliverables">>(
      deliverables.map((deliverable) => deliverable._id)
    );

    for (const task of tasks) {
      if (task.assignedAgentId) {
        const agent = await ctx.db.get(task.assignedAgentId);
        if (agent?.currentTaskId === task._id) {
          await ctx.db.patch(agent._id, {
            currentTaskId: undefined,
            status: agent.status === "busy" ? "online" : agent.status,
          });
        }
      }
      await ctx.db.delete(task._id);
    }

    for (const deliverable of deliverables) {
      await ctx.db.delete(deliverable._id);
    }

    await ctx.db.delete(args.id);

    const allEvents = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .collect();

    let deletedEventCount = 0;
    for (const event of allEvents) {
      const data = event.data as
        | {
            projectId?: Id<"projects">;
            taskId?: Id<"tasks">;
            deliverableId?: Id<"deliverables">;
          }
        | undefined;

      if (
        data?.projectId === args.id ||
        (data?.taskId !== undefined && taskIds.has(data.taskId)) ||
        (data?.deliverableId !== undefined &&
          deliverableIds.has(data.deliverableId))
      ) {
        await ctx.db.delete(event._id);
        deletedEventCount += 1;
      }
    }

    await ctx.db.insert("events", {
      type: "project_removed",
      message: `Project removed: ${project.name}`,
      data: {
        projectId: args.id,
        deletedTaskCount: tasks.length,
        deletedDeliverableCount: deliverables.length,
        deletedEventCount,
      },
      timestamp: Date.now(),
    });
  },
});

// Backward-compatible alias for previous API name
export const withDetails = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => loadProjectDetails(ctx, args.id),
});
