import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all active worker templates
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("workerTemplates")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Get template by ID
export const get = query({
  args: { id: v.id("workerTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new worker template
export const create = mutation({
  args: {
    name: v.string(),
    displayName: v.string(),
    role: v.string(),
    taskTypes: v.array(v.string()),
    model: v.string(),
    tools: v.array(v.string()),
    skills: v.array(v.string()),
    systemPrompt: v.string(),
    reviewEvery: v.number(),
    maxParallel: v.number(),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workerTemplates", {
      name: args.name,
      displayName: args.displayName,
      role: args.role,
      taskTypes: args.taskTypes,
      model: args.model,
      tools: args.tools,
      skills: args.skills,
      systemPrompt: args.systemPrompt,
      reviewEvery: args.reviewEvery,
      maxParallel: args.maxParallel,
      status: args.status ?? "active",
    });
  },
});

// Get template by name
export const byName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workerTemplates")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Update a worker template
export const update = mutation({
  args: {
    id: v.id("workerTemplates"),
    name: v.optional(v.string()),
    displayName: v.optional(v.string()),
    role: v.optional(v.string()),
    taskTypes: v.optional(v.array(v.string())),
    model: v.optional(v.string()),
    tools: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    systemPrompt: v.optional(v.string()),
    reviewEvery: v.optional(v.number()),
    maxParallel: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
