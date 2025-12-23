import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCurrentSubscription = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      return undefined;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    return subscription;
  },
});
