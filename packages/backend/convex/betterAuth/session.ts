import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const setActiveProfile = mutation({
  args: {
    profileId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { profileId, sessionId }) => {
    // TODO: verify if profileId exists
    await ctx.db.patch("session", sessionId as Id<"session">, {
      activeProfileId: profileId,
    });
  },
});
