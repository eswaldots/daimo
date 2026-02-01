import { ConvexError, v } from "convex/values";
import { components } from "../_generated/api";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const getAllUsers = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (user?.role !== "admin") {
      throw new ConvexError("Unautorizado");
    }

    return await ctx.runQuery(components.betterAuth.user.getAllUsers);
  },
});

export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (user?.role !== "admin") {
      throw new ConvexError("Unautorizado");
    }

    return await ctx.runQuery(components.betterAuth.user.getById, { id });
  },
});
