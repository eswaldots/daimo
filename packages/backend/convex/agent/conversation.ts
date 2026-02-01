import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { conversationFields } from "./schema";
import { serverMutation } from "../utils";

const { isLive, userId, ...filteredConversationFields } = conversationFields;

export const createConversation = mutation({
  args: filteredConversationFields,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Error, usuario no autenticado");
    }

    return await ctx.db.insert("conversations", {
      ...args,
      isLive: false,
      userId: user._id,
    });
  },
});

export const updateConversationState = serverMutation({
  args: {
    isLive: v.boolean(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { isLive, conversationId }) => {
    await ctx.db.patch(conversationId, {
      isLive,
    });
  },
});

export const getConversationsByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (user.role !== "admin") {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db
      .query("conversations")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
  },
});
