import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const internalCreate = internalMutation({
  args: {
    creatorId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    prompt: v.string(),
    shortDescription: v.string(),
    firstMessagePrompt: v.string(),
    voiceId: v.string(),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("characters", { ...args });
  },
});
