import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const setCompletedOnboarding = mutation({
  args: {
    userId: v.id("user"),
    completedOnboarding: v.boolean(),
  },
  handler: async (ctx, { userId, completedOnboarding }) => {
    return await ctx.db.patch(userId, { completedOnboarding });
  },
});
