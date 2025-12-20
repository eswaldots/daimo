import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent } from "./auth";

export const create = mutation({
  args: {
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    shortDescription: v.string(),
    description: v.optional(v.string()),
    firstMessagePrompt: v.string(),
    prompt: v.string(),
    voiceId: v.string(),
    ttsProvider: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new Error("User not authorized");
    }

    await ctx.runMutation(internal.internalCharacters.internalCreate, {
      ...args,
      creatorId: user._id,
    });
  },
});
