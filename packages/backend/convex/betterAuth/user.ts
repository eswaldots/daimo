import { v } from "convex/values";
import { paginator } from "convex-helpers/server/pagination";
import { doc } from "convex-helpers/validators";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";

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
  returns: v.union(
    paginationResultValidator(doc(schema, "user")),
    v.array(doc(schema, "user")),
  ),
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { search, paginationOpts }) => {
    if (search) {
      return await ctx.db
        .query("user")
        .withSearchIndex("search_name", (q) => q.search("name", search))
        .take(5);
    } else
      return await paginator(ctx.db, schema)
        .query("user")
        .order("desc")
        .paginate(paginationOpts);
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

export const createUser = mutation({
  args: doc(schema, "user").omit("_id").omit("_creationTime"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("user", { ...args });
  },
});
