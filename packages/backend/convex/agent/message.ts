import { ConvexError, v } from "convex/values";
import { serverMutation } from "../utils";
import { messageFields } from "./schema";
import { authComponent } from "../auth";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";

export const addMessage = serverMutation({
  args: messageFields,
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", args);
  },
});

export const getMessagesByConversationId = query({
  args: {
    id: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { id, paginationOpts }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (user.role !== "admin") {
      throw new ConvexError("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) => q.eq("conversationId", id))
      .paginate(paginationOpts);

    return {
      ...messages,
    };
  },
});
