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
import { api, components } from "../_generated/api";

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
      return [];
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
  args: {
    ...childrenFieldsWithoutFatherId,
    parentalToken: v.optional(v.id("parentalToken")),
  },
  handler: async (ctx, { parentalToken, ...args }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("No autenticado");
    }

    const profiles = await ctx.runQuery(api.parental.profile.getProfiles);

    // the first profile is from the parent and the second profile can be created without pin security, but the third one has to be secured
    if (profiles.length > 1) {
      if (!parentalToken)
        throw new ConvexError(
          "You have to pass the Token for change to the owner profile",
        );

      const token = await ctx.db.get(parentalToken);

      if (!token) throw new ConvexError("Token not found");
      if (token.used) throw new ConvexError("Token already used");
      if (token.expiresAt <= Date.now()) throw new ConvexError("Token expired");

      await ctx.db.patch(parentalToken, { used: true });
    }

    const profileId = await ctx.db.insert("profile", {
      ...args,
      userId: user._id,
      isOwner: false,
    });

    // TODO: check if we can get sessionId in the headers and only query, it will be more performant
    // @ts-ignore typescript is driving me nuts bro
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
    // @ts-ignore typescript is driving me nuts bro
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    const data = await auth.api.getSession({ headers });

    if (!data?.session) {
      throw new ConvexError("There is no active session");
    }

    // @ts-ignore typescript is driving me nuts bro
    if (!data.session.activeProfileId) {
      return null;
    }

    const profile = await ctx.db.get(
      // @ts-ignore typescript is driving me nuts bro
      data.session.activeProfileId as Id<"profile">,
    );

    return profile;
  },
});

export const getProfiles = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unautorizado");
    }

    const profiles = await ctx.db
      .query("profile")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    return profiles;
  },
});

export const setActiveProfile = mutation({
  args: {
    profileId: v.id("profile"),
    parentalToken: v.optional(v.id("parentalToken")),
  },
  handler: async (ctx, { profileId, parentalToken }) => {
    // TODO: check if we can get sessionId in the headers and only query, it will be more performant
    // @ts-ignore typescript is driving me nuts bro
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    const data = await auth.api.getSession({ headers });

    if (!data?.session) {
      throw new ConvexError("There is no active session");
    }

    const profile = await ctx.db.get(profileId);

    if (!profile) {
      throw new ConvexError("There is no profile to show");
    }

    if (profile.userId !== data.user.id) {
      throw new ConvexError("User doesn't behave this profile");
    }

    const hasPin = await ctx.runQuery(api.parental.security.hasPin);

    // if doesn't have pin no change, TODO: user haves to create pin
    if (profile.isOwner && hasPin) {
      if (!parentalToken)
        throw new ConvexError(
          "You have to pass the code arg for change to the owner profile",
        );

      const token = await ctx.db.get(parentalToken);

      if (!token) throw new ConvexError("Token not found");
      if (token.used) throw new ConvexError("Token already used");
      if (token.expiresAt <= Date.now()) throw new ConvexError("Token expired");

      await ctx.db.patch(parentalToken, { used: true });
    }

    await ctx.runMutation(components.betterAuth.session.setActiveProfile, {
      profileId,
      sessionId: data.session.id,
    });
  },
});

export const getProfileById = internalQuery({
  args: {
    profileId: v.id("profile"),
  },
  handler: async (ctx, { profileId }) => {
    return await ctx.db.get(profileId);
  },
});
