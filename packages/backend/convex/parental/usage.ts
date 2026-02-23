import { ConvexError } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

// this query only calls the active or the last children to the parent only redirect to the dashboard
export const getLastActiveProfileId = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unauthenticated");
    }

    // first check if a conversation isLive
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("userId_isLive", (q) =>
        q.eq("userId", user._id).eq("isLive", true),
      )
      .first();

    if (conversation) {
      return conversation.profileId;
    } else {
      const lastConversation = await ctx.db
        .query("conversations")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      return lastConversation?.profileId;
    }
  },
});
