import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { conversationFields } from "./schema";
import { serverMutation } from "../utils";
import { asyncMap } from "convex-helpers";

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

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const conversationsWithCharacter = await asyncMap(
      conversations,
      async (conversation) => {
        const character = await ctx.db.get(conversation.characterId);

        if (!character || !character?.storageId) return;

        const image = await ctx.storage.getUrl(character.storageId);

        return {
          ...conversation,
          character: {
            ...character,
            image,
          },
        };
      },
    );

    return {
      user: user,
      conversations: conversationsWithCharacter,
    };
  },
});

export const getLatestConversationOfUser = internalQuery({
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
      .first();
  },
});

export const getConversationById = query({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, { id }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (user.role !== "admin") {
      throw new ConvexError("Unauthorized");
    }

    const conversation = await ctx.db.get(id);

    if (!conversation) return null;

    const character = await ctx.db.get(conversation.characterId);

    if (!character?.storageId) return null;

    const image = await ctx.storage.getUrl(character.storageId);

    return { ...conversation, character: { ...character, image } };
  },
});
