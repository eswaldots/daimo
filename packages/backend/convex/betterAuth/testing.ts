import { v } from "convex/values";
import { internal } from "./_generated/api";
import { TableNames } from "./_generated/dataModel";
import schema from "./schema";
import { DELETE_BATCH_SIZE } from "../testing";
import { internalMutation, mutation } from "./_generated/server";
import { paginator } from "convex-helpers/server/pagination";

export const wipeAllTables = mutation({
  handler: async (ctx) => {
    for (const tableName of Object.keys(schema.tables)) {
      await ctx.scheduler.runAfter(0, internal.testing.deletePage, {
        tableName,
        cursor: null,
      });
    }
  },
});

export const deletePage = internalMutation({
  args: {
    tableName: v.string(),
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const results = await paginator(ctx.db, schema)
      .query(args.tableName as TableNames)
      .paginate({ cursor: args.cursor, numItems: DELETE_BATCH_SIZE });
    for (const row of results.page) {
      await ctx.db.delete(row._id);
    }
    if (!results.isDone) {
      await ctx.scheduler.runAfter(0, internal.testing.deletePage, {
        tableName: args.tableName,
        cursor: results.continueCursor,
      });
    }
  },
});
