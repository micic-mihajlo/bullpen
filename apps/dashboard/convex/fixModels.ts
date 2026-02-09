import { mutation } from "./_generated/server";

export const updateToSonnet45 = mutation({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("workerTemplates").collect();
    let updated = 0;
    for (const t of templates) {
      if (t.model === "claude-sonnet-4") {
        await ctx.db.patch(t._id, { model: "claude-sonnet-4-5" });
        updated++;
      }
    }
    return { updated };
  },
});
