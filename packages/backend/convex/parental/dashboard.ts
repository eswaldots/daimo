// this file exports a function by screen of the dashboard, this is because convex data layer is very fact querying data, but the bandwith is not that fast TODO: better this docs

import { ConvexError, v } from "convex/values";
import { profileQuery } from "../utils";
import { ErrorCode } from "@daimo/lib";
import { TableAggregate } from "@convex-dev/aggregate";
import { DataModel, Doc, Id } from "../_generated/dataModel";
import { api, components } from "../_generated/api";
import { asyncMap } from "convex-helpers";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth";

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

export interface GetOverviewInfoResponse {
  weeklyUsageTime: number;
  warnings: ({
    message: Doc<"messages"> | null;
  } & Doc<"interactionFlags">)[];
  usage: {
    day: number;
    milliseconds: number;
  }[];
  lastConversation: Doc<"conversations"> & {
    character: Doc<"characters"> | null;
  };
  weeklyConversationCount: number;
  weeklyAverageDuration: number;
  profile: Doc<"profile">;
}

export const getOverviewInfo = profileQuery({
  args: {
    profileId: v.id("profile"),
    clientTimestamp: v.number(),
  },
  handler: async (
    ctx,
    { profileId, clientTimestamp },
  ): Promise<GetOverviewInfoResponse> => {
    const user = await authComponent.getAuthUser(ctx);

    const profile = await ctx.db.get(profileId);

    if (!profile) {
      throw new ConvexError({
        code: ErrorCode.NotFound,
        message: "Perfil no encontrado",
      });
    }

    if (profile.userId !== user._id) {
      throw new ConvexError({
        code: ErrorCode.Unauthorized,
        message: "Este perfil no te pertenece",
      });
    }

    const { firstday, lastday } = getDaysOfWeek(clientTimestamp);

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

    // TODO: paginate if is necesary
    const warnings = await ctx.db
      .query("interactionFlags")
      .withIndex("profileId_status", (q) =>
        q.eq("profileId", profileId).eq("status", "active"),
      )
      .take(50);

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

const getDaysOfWeek = (clientTimestamp: number) => {
  const now = new Date(clientTimestamp);

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

export const resolveIssue = mutation({
  args: {
    interactionFlagId: v.id("interactionFlags"),
  },
  handler: async (ctx, { interactionFlagId }) => {
    const user = await authComponent.getAuthUser(ctx);

    const interactionFlag = await ctx.db.get(interactionFlagId);

    if (!interactionFlag) {
      throw new ConvexError({
        message: "No se encontro la alerta",
        code: ErrorCode.NotFound,
      });
    }

    const profile = await ctx.db.get(interactionFlag.profileId);

    if (!profile) {
      throw new ConvexError({
        message: "El perfil no se pudo encontrar",
        code: ErrorCode.NotFound,
      });
    }

    if (user._id !== profile.userId) {
      throw new ConvexError({
        message: "Este perfil no te pertenece",
        code: ErrorCode.Unauthorized,
      });
    }

    return await ctx.db.patch(interactionFlagId, {
      status: "resolved",
      reviewedAt: Date.now(),
    });
  },
});
