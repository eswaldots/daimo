import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { getAll } from "convex-helpers/server/relationships";
import { profileFields } from "./schema";
import { authComponent, createAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";
import { components } from "../_generated/api";

export const getByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<Doc<"profile">[]> => {
    return await ctx.db
      .query("profile")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getProfileTags = internalQuery({
  args: { profileId: v.id("profile") },
  handler: async (
    ctx,
    { profileId },
  ): Promise<(Doc<"tags"> | null)[] | null> => {
    const links = await ctx.db
      .query("profileTags")
      .withIndex(
        "by_profile_id",
        (q) => q.eq("profileId", profileId),
        // TODO: review if a collect is needed
      )
      .collect();

    if (!links) {
      return null;
    }

    const tagsIds = links.map((tag) => tag.tagId);

    const tags = await getAll(ctx.db, tagsIds);

    return tags;
  },
});

const {
  likes,
  userId: fatherId,
  isOwner,
  ...childrenFieldsWithoutFatherId
} = profileFields;

export const createProfile = mutation({
  args: childrenFieldsWithoutFatherId,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("No autenticado");
    }

    const profileId = await ctx.db.insert("profile", {
      ...args,
      userId: user._id,
      isOwner: false,
    });

    // TODO: check if we can get sessionId in the headers and only query, it will be more performant
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    const data = await auth.api.getSession({ headers });

    if (!data?.session) {
      throw new ConvexError("There is no active session");
    }

    await ctx.runMutation(components.betterAuth.session.setActiveProfile, {
      profileId,
      sessionId: data.session.id,
    });
  },
});

export const createInternalProfile = internalMutation({
  args: profileFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("profile", { ...args });
  },
});

export const getCurrentProfile = query({
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    const data = await auth.api.getSession({ headers });

    if (!data?.session) {
      throw new ConvexError("There is no active session");
    }

    if (!data.session.activeProfileId) {
      return null;
    }

    const profile = await ctx.db.get(
      data.session.activeProfileId as Id<"profile">,
    );

    return profile;
  },
});
