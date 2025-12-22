import { internalQuery, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { ConvexError, v } from "convex/values";

export const starCharacter = mutation({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unauthenticated");
    }

    await ctx.db.insert("stars", {
      starredBy: user._id,
      starredCharacter: characterId,
    });
  },
});

export const unstarCharacter = mutation({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unauthenticated");
    }

    const star = await ctx.db
      .query("stars")
      .withIndex("by_user_and_character_id", (q) =>
        q.eq("starredBy", user._id).eq("starredCharacter", characterId),
      )
      .unique();

    if (!star) {
      throw new ConvexError("User has not starred this character");
    }

    await ctx.db.delete(star._id);
  },
});

export const isStarringCharacter = internalQuery({
  args: {
    userId: v.string(),
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId, userId }) => {
    const star = await ctx.db
      .query("stars")
      .withIndex("by_user_and_character_id", (q) =>
        q.eq("starredBy", userId).eq("starredCharacter", characterId),
      )
      .unique();

    return !!star;
  },
});
