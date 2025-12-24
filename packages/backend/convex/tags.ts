import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, { searchTerm }) => {
    if (searchTerm) {
      return await ctx.db
        .query("tags")
        .withSearchIndex("search_by_name", (q) => q.search("name", searchTerm))
        .collect();
    } else {
      return await ctx.db.query("tags").take(10);
    }
  },
});
