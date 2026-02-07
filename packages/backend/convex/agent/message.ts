import { ConvexError, v } from "convex/values";
import { serverMutation } from "../utils";
import { messageFields } from "./schema";
import { authComponent } from "../auth";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import { internal } from "../_generated/api";

export const addMessage = serverMutation({
  args: messageFields,
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", args);

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      return;
    }

    if (!conversation.title) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("conversationId", (q) =>
          q.eq("conversationId", args.conversationId),
        )
        .order("desc")
        // if we take 3 and the 3 exists is because the conversations has two or more messages
        .take(3);

      if (messages.length >= 2) {
        await ctx.scheduler.runAfter(0, internal.agent.llm.generateTitle, {
          conversationId: args.conversationId,
          context: messages
            .reverse()
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n"),
        });
      }
    }
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
