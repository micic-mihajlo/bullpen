// Legacy agents module — re-exports from workerTemplates for backward compat
// All new code should use api.workerTemplates directly
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("workerTemplates")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Map to legacy agent shape for backward compat with sidebar/command center
    return templates.map((t) => ({
      _id: t._id,
      _creationTime: t._creationTime,
      name: t.displayName,
      status: "online" as const,
      role: t.role,
      model: t.model,
      lastSeen: Date.now(),
    }));
  },
});
