import {
  customAction,
  customMutation,
  customQuery,
  customCtx,
} from "convex-helpers/server/customFunctions";
import { action, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { verifyApiKey } from "./auth/apiKey";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { ErrorCode } from "@daimo/lib";
import { Id } from "./_generated/dataModel";

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

/** Defines a query with the profileId in the ctx,
 * also verifying that user is authenticated and set up an profile for the session correctly
 * */
export const profileQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    // TODO: check if we can get sessionId in the headers and only query, it will be more performant
    // @ts-ignore typescript please
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    const data = await auth.api.getSession({ headers });

    if (!data) {
      throw new ConvexError({
        code: ErrorCode.Unauthorized,
        message: "Unauthorized",
      });
    }

    // @ts-ignore typescript please
    if (!data.session.activeProfileId) {
      throw new ConvexError({
        code: ErrorCode.NoProfileSelected,
        message: "No profile selected",
      });
    }

    return {
      // @ts-ignore typescript please
      activeProfileId: data.session.activeProfileId as Id<"profile">,
    };
  }),
);
