import { serverMutation } from "../utils";
import { messageFields } from "./schema";

export const addMessage = serverMutation({
  args: messageFields,
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", args);
  },
});
