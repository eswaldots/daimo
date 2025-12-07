import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const internalCreate = internalMutation({
  args: {
    creatorId: v.string(),
    name: v.string(),
    description: v.string(),
    storageId: v.id("_storage"),
    voicePrompt: v.string(),
    firstMessagePrompt: v.string(),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("characters", { ...args });
  },
});
