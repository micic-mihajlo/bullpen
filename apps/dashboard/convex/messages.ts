import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get conversation between two agents (legacy — uses string IDs)
export const conversation = query({
  args: {
    agentId: v.string(),
    withAgentId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

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

    if (args.withAgentId) {
      messages = messages.filter(
        (m) =>
          m.fromAgentId === args.withAgentId ||
          m.toAgentId === args.withAgentId
      );
    }

    const seen = new Set();
    messages = messages
      .filter((m) => {
        if (seen.has(m._id)) return false;
        seen.add(m._id);
        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);

    return messages;
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

    return messages.reverse();
  },
});

// Send a message
export const send = mutation({
  args: {
    fromAgentId: v.string(),
    toAgentId: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      fromAgentId: args.fromAgentId,
      toAgentId: args.toAgentId,
      content: args.content,
      timestamp: Date.now(),
      read: false,
    });

    await ctx.db.insert("events", {
      type: "message_sent",
      message: `Message sent: "${args.content.slice(0, 50)}${args.content.length > 50 ? "..." : ""}"`,
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
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_to", (q) => q.eq("toAgentId", args.agentId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return messages.length;
  },
});
