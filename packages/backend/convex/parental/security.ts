import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "../_generated/server";
import { authComponent } from "../auth";
import { components, internal } from "../_generated/api";
import { ActionCache } from "@convex-dev/action-cache";
import { Id } from "../_generated/dataModel";

const cache = new ActionCache(components.actionCache, {
  action: internal.parental.actions.verifyPin,
});

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

    if (pin.length != 4) {
      throw new ConvexError(
        "Invalid pin length, expected a length of 4 numbers",
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

export const verifyPin = action({
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

    if (pin.length != 4) {
      throw new ConvexError(
        "Invalid pin length, expected a length of 4 numbers",
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

export const verify = action({
  args: {
    pin: v.string(),
  },
  handler: async (ctx, { pin }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unauthenticated");
    }

    const isPinCorrect = await cache.fetch(ctx, {
      password: pin,
      userId: user._id,
    });

    if (!isPinCorrect) {
      throw new ConvexError("PIN is not correct");
    }

    const tokenId: Id<"parentalToken"> = await ctx.runMutation(
      internal.parental.security.createTOPT,
      { userId: user._id },
    );

    return tokenId;
  },
});

export const createTOPT = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db.insert("parentalToken", {
      used: false,
      userId: userId,
      expiresAt: Date.now() + 60000,
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

export const getPinByUser = internalQuery({
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
