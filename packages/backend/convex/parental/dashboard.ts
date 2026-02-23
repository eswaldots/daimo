// this file exports a function by screen of the dashboard, this is because convex data layer is very fact querying data, but the bandwith is not that fast TODO: better this docs

import { ConvexError, v } from "convex/values";
import { profileQuery } from "../utils";
import { ErrorCode } from "@daimo/lib";
import { TableAggregate } from "@convex-dev/aggregate";
import { DataModel, Doc, Id } from "../_generated/dataModel";
import { api, components } from "../_generated/api";
import { asyncMap } from "convex-helpers";

export const agreggateUsageTimeByProfile = new TableAggregate<{
  Key: [Id<"profile">, number];
  DataModel: DataModel;
  Namespace: Id<"profile">;
  TableName: "conversations";
}>(components.agreggateUsageTimeByProfile, {
  sortKey: (doc) => [doc.profileId, doc.endedAt ?? 0],
  namespace: (doc) => doc.profileId,
  sumValue: (doc) => doc.duration ?? 0,
});

// @ts-ignore hahaha i'm typescript look at me i'm stupid
export const getOverviewInfo = profileQuery({
  args: {
    profileId: v.id("profile"),
  },
  // @ts-ignore hahaha i'm typescript look at me i'm stupid
  handler: async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId);

    if (!profile) {
      throw new ConvexError({
        code: ErrorCode.NotFound,
        message: "Profile not found",
      });
    }

    const { firstday, lastday } = getDaysOfWeek();

    const sum = await agreggateUsageTimeByProfile.sum(ctx, {
      namespace: profile._id,
      bounds: {
        lower: { key: [profileId, firstday], inclusive: true },
        upper: { key: [profileId, lastday], inclusive: true },
      },
    });

    const count = await agreggateUsageTimeByProfile.count(ctx, {
      namespace: profile._id,
      bounds: {
        lower: { key: [profileId, firstday], inclusive: true },
        upper: { key: [profileId, lastday], inclusive: true },
      },
    });

    const averageDuration = count > 0 ? sum / count : 0;

    const usage: { day: number; milliseconds: number }[] = [];

    for (let day = firstday; day <= lastday; day += 24 * 60 * 60 * 1000) {
      const startOfDay = day;
      const endOfDay = day + 24 * 60 * 60 * 1000 - 1;

      const durationMs = await agreggateUsageTimeByProfile.sum(ctx, {
        namespace: profile._id,
        bounds: {
          lower: { key: [profileId, startOfDay], inclusive: true },
          upper: { key: [profileId, endOfDay], inclusive: true },
        },
      });

      usage.push({
        day: day,
        milliseconds: durationMs,
      });
    }

    let lastConversation = await ctx.db
      .query("conversations")
      .withIndex("profileId", (q) => q.eq("profileId", profileId))
      .order("desc")
      .first();

    if (!lastConversation) {
      throw new ConvexError("TODO: handle no usage data");
    }

    const character: Doc<"characters"> | null = await ctx.runQuery(
      api.characters.getById,
      {
        characterId: lastConversation.characterId,
      },
    );

    const warnings = await ctx.db
      .query("interactionFlags")
      .withIndex("profileId", (q) => q.eq("profileId", profileId))
      .collect();

    return {
      weeklyUsageTime: sum,
      warnings: await asyncMap(warnings, async (warning) => {
        const message = await ctx.db.get(warning.messageId);

        return { ...warning, message };
      }),
      usage,
      lastConversation: { ...lastConversation, character },
      weeklyConversationCount: count,
      weeklyAverageDuration: averageDuration,
      profile,
    };
  },
});

const getDaysOfWeek = () => {
  const now = new Date();

  const start = new Date(now);

  const diff =
    start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1);

  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    firstday: start.getTime(),
    lastday: end.getTime(),
  };
};
