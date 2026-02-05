import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all clients
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").order("desc").collect();
  },
});

// Get client by ID
export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get active clients
export const active = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Create a new client
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    avatar: v.optional(v.string()),
    plan: v.optional(v.string()),
    channel: v.optional(v.string()),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clientId = await ctx.db.insert("clients", {
      name: args.name,
      email: args.email,
      company: args.company,
      avatar: args.avatar,
      status: "active",
      plan: args.plan || "starter",
      channel: args.channel,
      channelId: args.channelId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("events", {
      type: "client_created",
      message: `New client: ${args.name}${args.company ? ` (${args.company})` : ""}`,
      data: { clientId },
      timestamp: Date.now(),
    });

    return clientId;
  },
});

// Update client
export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("churned")
    )),
    plan: v.optional(v.string()),
    channel: v.optional(v.string()),
    channelId: v.optional(v.string()),
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

// Delete client
export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("events", {
      type: "client_removed",
      message: `Client removed: ${client.name}`,
      timestamp: Date.now(),
    });
  },
});

// Get client with their projects
export const withProjects = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) return null;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect();

    return { ...client, projects };
  },
});
