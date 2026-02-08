import { ConvexError, v } from "convex/values";
import { components, internal } from "../_generated/api";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import { asyncMap } from "convex-helpers";
import { Doc } from "../_generated/dataModel";
import { Doc as AuthDoc } from "../betterAuth/_generated/dataModel";
import { paginationOptsValidator, PaginationResult } from "convex/server";

type UserWithInfo = AuthDoc<"user"> & {
  lastConversation: Doc<"conversations"> | null;
};

export const getAllUsers = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (
    ctx,
    { search, paginationOpts },
  ): Promise<PaginationResult<UserWithInfo>> => {
    const user = await authComponent.getAuthUser(ctx);

    if (user?.role !== "admin") {
      throw new ConvexError("Unautorizado");
    }

    const users = await ctx.runQuery(components.betterAuth.user.getAllUsers, {
      search,
      paginationOpts,
    });

    const usersWithInfo = await asyncMap(
      // @ts-ignore muerdelo
      users?.page ?? users,
      async (user: { _id: string }) => {
        const lastConversation = await ctx.db
          .query("conversations")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .order("desc")
          .first();

        return { ...user, lastConversation };
      },
    );

    // @ts-expect-error this is because will not return an id from convex main component
    return { ...users, page: usersWithInfo };
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
