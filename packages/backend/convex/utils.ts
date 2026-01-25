import {
  customAction,
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { action, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { verifyApiKey } from "./auth/apiKey";
import { internal } from "./_generated/api";

// only can be call for another servers outside of convex with api keys, not for clients
export const serverMutation = customMutation(mutation, {
  args: { apiKey: v.string() },
  input: async (ctx, { apiKey }) => {
    if (!apiKey)
      throw new ConvexError("apiKey is required to call this mutation");

    const isValid = await verifyApiKey(ctx, apiKey);

    if (!isValid)
      throw new ConvexError("apiKey is required to call this mutation");

    return { ctx: {}, args: {} };
  },
});

export const serverAction = customAction(action, {
  args: { apiKey: v.string() },
  input: async (ctx, { apiKey }) => {
    if (!apiKey)
      throw new ConvexError("apiKey is required to call this mutation");

    const isValid = await ctx.runQuery(internal.auth.apiKey.verify, {
      key: apiKey,
    });

    if (!isValid)
      throw new ConvexError("apiKey is required to call this mutation");

    return { ctx: {}, args: {} };
  },
});
