import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get conversation between two agents (or all messages for an agent)
export const conversation = query({
  args: {
    agentId: v.id("agents"),
    withAgentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Get all messages involving this agent
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_from", (q) => q.eq("fromAgentId", args.agentId))
      .order("desc")
      .take(limit);

    const received = await ctx.db
      .query("messages")
      .withIndex("by_to", (q) => q.eq("toAgentId", args.agentId))
      .order("desc")
      .take(limit);

    let messages = [...sent, ...received];

    // Filter by conversation partner if specified
    if (args.withAgentId) {
      messages = messages.filter(
        (m) =>
          m.fromAgentId === args.withAgentId ||
          m.toAgentId === args.withAgentId
      );
    }

    // Sort by timestamp and dedupe
    const seen = new Set();
    messages = messages
      .filter((m) => {
        if (seen.has(m._id)) return false;
        seen.add(m._id);
        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);

    // Enrich with agent info
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const fromAgent = await ctx.db.get(msg.fromAgentId);
        const toAgent = msg.toAgentId
          ? await ctx.db.get(msg.toAgentId)
          : null;
        return { ...msg, fromAgent, toAgent };
      })
    );

    return enriched;
  },
});

// Get broadcast messages (no specific recipient)
export const broadcasts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_to", (q) => q.eq("toAgentId", undefined))
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const fromAgent = await ctx.db.get(msg.fromAgentId);
        return { ...msg, fromAgent };
      })
    );

    return enriched.reverse();
  },
});

// Send a message
export const send = mutation({
  args: {
    fromAgentId: v.id("agents"),
    toAgentId: v.optional(v.id("agents")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const fromAgent = await ctx.db.get(args.fromAgentId);
    if (!fromAgent) throw new Error("Sender agent not found");

    if (args.toAgentId) {
      const toAgent = await ctx.db.get(args.toAgentId);
      if (!toAgent) throw new Error("Recipient agent not found");
    }

    const messageId = await ctx.db.insert("messages", {
      fromAgentId: args.fromAgentId,
      toAgentId: args.toAgentId,
      content: args.content,
      timestamp: Date.now(),
      read: false,
    });

    // Log as event
    const recipient = args.toAgentId
      ? (await ctx.db.get(args.toAgentId))?.name ?? "unknown"
      : "everyone";

    await ctx.db.insert("events", {
      agentId: args.fromAgentId,
      type: "message_sent",
      message: `${fromAgent.name} → ${recipient}: "${args.content.slice(0, 50)}${args.content.length > 50 ? "..." : ""}"`,
      data: { messageId, toAgentId: args.toAgentId },
      timestamp: Date.now(),
    });

    return messageId;
  },
});

// Mark message as read
export const markRead = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});

// Get unread count for an agent
export const unreadCount = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_to", (q) => q.eq("toAgentId", args.agentId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return messages.length;
  },
});
