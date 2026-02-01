import { v } from "convex/values";
import { doc } from "convex-helpers/validators";
import { mutation, query } from "./_generated/server";
import schema from "./schema";

export const setCompletedOnboarding = mutation({
  args: {
    userId: v.id("user"),
    completedOnboarding: v.boolean(),
  },
  handler: async (ctx, { userId, completedOnboarding }) => {
    return await ctx.db.patch(userId, { completedOnboarding });
  },
});

export const getAllUsers = query({
  returns: v.array(doc(schema, "user")),
  handler: async (ctx) => {
    return await ctx.db.query("user").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("user"),
  },
  returns: v.nullable(doc(schema, "user")),
  handler: async (ctx, { id }) => {
    return await ctx.db
      .query("user")
      .withIndex("by_id", (q) => q.eq("_id", id))
      .unique();
  },
});
