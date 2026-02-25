import { mutation } from "./_generated/server";

// One-time cleanup: delete all tasks, workers, events, agentMessages
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    for (const t of tasks) await ctx.db.delete(t._id);
    
    const workers = await ctx.db.query("workers").collect();
    for (const w of workers) await ctx.db.delete(w._id);
    
    const events = await ctx.db.query("events").collect();
    for (const e of events) await ctx.db.delete(e._id);
    
    const messages = await ctx.db.query("agentMessages").collect();
    for (const m of messages) await ctx.db.delete(m._id);

    const deliverables = await ctx.db.query("deliverables").collect();
    for (const d of deliverables) await ctx.db.delete(d._id);

    const projects = await ctx.db.query("projects").collect();
    for (const p of projects) await ctx.db.delete(p._id);

    return {
      deleted: {
        tasks: tasks.length,
        workers: workers.length,
        events: events.length,
        messages: messages.length,
        deliverables: deliverables.length,
        projects: projects.length,
      }
    };
  },
});
