import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";

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
    const existing = await ctx.runQuery(internal.tags.internal.getTagByName, {
      name,
    });

    if (existing) {
      throw new ConvexError("A tag with this name already exists");
    }

    return await ctx.db.insert("tags", { name });
  },
});

export const relateTag = internalMutation({
  args: {
    tagId: v.id("tags"),
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("characterTags")
      .withIndex("by_character_and_tag", (q) =>
        q.eq("characterId", args.characterId).eq("tagId", args.tagId),
      )
      .unique();

    if (existing) {
      throw new ConvexError("Tag already related to this character");
    }

    return await ctx.db.insert("characterTags", { ...args });
  },
});

export const relateChildrenTag = internalMutation({
  args: {
    tagId: v.id("tags"),
    childrenId: v.id("childrens"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("childrenTags")
      .withIndex("by_children_and_tag", (q) =>
        q.eq("childrenId", args.childrenId).eq("tagId", args.tagId),
      )
      .unique();

    if (existing) {
      throw new ConvexError("Tag already related to this children");
    }

    return await ctx.db.insert("childrenTags", { ...args });
  },
});
