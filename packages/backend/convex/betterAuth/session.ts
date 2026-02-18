import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const setActiveProfile = mutation({
  args: {
    profileId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { profileId, sessionId }) => {
    // this is a internal mutation, so the external caller ALWAYS haves to verify the profileId exists
    //  TODO: verify the profileId inside of the mutation
    await ctx.db.patch("session", sessionId as Id<"session">, {
      activeProfileId: profileId,
    });
  },
});
