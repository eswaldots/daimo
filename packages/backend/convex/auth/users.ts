import { ConvexError, v } from "convex/values";
import { components, internal } from "../_generated/api";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import { asyncMap } from "convex-helpers";
import { Doc } from "../_generated/dataModel";
import { Doc as AuthDoc } from "../betterAuth/_generated/dataModel";

type UserWithInfo = AuthDoc<"user"> & {
  lastConversation: Doc<"conversations"> | null;
};

export const getAllUsers = query({
  handler: async (ctx): Promise<UserWithInfo[]> => {
    const user = await authComponent.getAuthUser(ctx);

    if (user?.role !== "admin") {
      throw new ConvexError("Unautorizado");
    }

    const users = await ctx.runQuery(components.betterAuth.user.getAllUsers);

    const usersWithInfo = await asyncMap(users, async (user) => {
      const lastConversation: Doc<"conversations"> | null = await ctx.runQuery(
        internal.agent.conversation.getLatestConversationOfUser,
        { userId: user._id },
      );

      return { ...user, lastConversation };
    });

    // @ts-expect-error this is because will not return an id from convex main component
    return usersWithInfo;
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
