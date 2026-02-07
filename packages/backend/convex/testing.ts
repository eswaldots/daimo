import { v } from "convex/values";
import { faker } from "@faker-js/faker";
import { TableNames } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import schema from "./schema";
import { components, internal } from "./_generated/api";

export const DELETE_BATCH_SIZE = 64;

// :)
export const wipeAllTables = internalMutation({
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
    const results = await ctx.db
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

export const seedTestUsers = internalMutation({
  args: {
    n: v.number(),
  },
  handler: async (ctx, { n }) => {
    faker.seed();

    for (let i = 0; i < n; i++) {
      await ctx.runMutation(components.betterAuth.user.createUser, {
        createdAt: faker.date.anytime().getDate(),
        updatedAt: faker.date.anytime().getDate(),
        email: faker.internet.email(),
        image: faker.image.avatar(),
        emailVerified: faker.datatype.boolean(),
        name: faker.person.fullName(),
      });
    }
  },
});
