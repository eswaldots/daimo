import { ConvexError, v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { authComponent } from "../auth";
import { internal } from "../_generated/api";

export const createPin = action({
  args: {
    pin: v.string(),
  },
  handler: async (ctx, { pin }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const actualHash = await ctx.runQuery(
      internal.parental.security.getActualHash,
      { userId: user._id },
    );

    if (!!actualHash) {
      throw new ConvexError("A pin yet exists");
    }

    if (pin.length != 5) {
      throw new ConvexError(
        "Invalid pin length, expected a length of 5 numbers",
      );
    }

    const { hash, salt } = await ctx.runAction(
      internal.parental.actions.hashPin,
      {
        password: pin,
      },
    );

    await ctx.runMutation(internal.parental.security.storeHash, {
      hash,
      salt,
      userId: user._id,
    });
  },
});

export const storeHash = internalMutation({
  args: {
    hash: v.string(),
    salt: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { hash, salt, userId }) => {
    return await ctx.db.insert("parentalSecurity", {
      pinHash: hash,
      userId: userId,
      pinSalt: salt,
    });
  },
});

export const getActualHash = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("parentalSecurity")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const hasPin = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const pin = await ctx.db
      .query("parentalSecurity")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();

    return !!pin;
  },
});
