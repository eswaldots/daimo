import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getTagByName = internalQuery({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    return await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
  },
});

export const createTag = internalMutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    return await ctx.db.insert("tags", { name });
  },
});

export const relateTag = internalMutation({
  args: {
    tagId: v.id("tags"),
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("characterTags", { ...args });
  },
});
