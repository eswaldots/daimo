// all of this are public functions to perform server tracking of the onboarding process

import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { api, components, internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";

// TODO: Don't use magic strings
export const checkOnboardingRedirect = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("No autenticado");
    }

    const children = await ctx.runQuery(
      internal.parental.children.getByFatherId,
      { fatherId: user._id },
    );

    if (!children) {
      return "/onboarding/getting-started";
    }

    const childrenTags: (Doc<"tags"> | null)[] | null = await ctx.runQuery(
      internal.parental.children.getChildrenTags,
      { childrenId: children._id },
    );

    if (!childrenTags || childrenTags?.length === 0) {
      return "/onboarding/profile-tags";
    }

    return "/onboarding/character-selection";
  },
});

export const finishOnboarding = mutation({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("No autenticado");
    }

    return await ctx.runMutation(
      components.betterAuth.user.setCompletedOnboarding,
      {
        userId: user._id,
        completedOnboarding: true,
      },
    );
  },
});

export const saveChildrenTags = mutation({
  args: {
    tags: v.array(v.id("tags")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user || user?.role !== "admin") {
      throw new ConvexError("No autorizado");
    }

    const children = await ctx.runQuery(
      internal.parental.children.getByFatherId,
      { fatherId: user._id },
    );

    if (!children) {
      throw new ConvexError("Usuario no tiene hijos");
    }

    const promises = args.tags.map(async (name) => {
      try {
        await ctx.runMutation(internal.tags.internal.relateChildrenTag, {
          childrenId: children._id,
          tagId: name,
        });
      } catch {
        // only warning
        console.warn("Duplicated tag tried to relate to children");
      }
    });

    await Promise.all(promises);

    await ctx.runMutation(api.auth.onboarding.finishOnboarding);
  },
});

export const createOnboardingTag = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user || user?.role !== "admin") {
      throw new ConvexError("No autorizado");
    }

    const tagsId = await Promise.all(
      args.tags.map(async (name): Promise<Id<"tags">> => {
        const existing: Doc<"tags"> | null = await ctx.runQuery(
          internal.tags.internal.getTagByName,
          {
            name,
          },
        );

        if (existing) {
          return existing._id;
        }

        const id: Id<"tags"> = await ctx.runMutation(
          internal.tags.internal.createTag,
          {
            name,
          },
        );

        return id;
      }),
    );

    const { tags: _, ...onboardingTag } = args;

    return await ctx.db.insert("onboardingTags", { ...onboardingTag, tagsId });
  },
});

export const getOnboardingTags = query({
  handler: async (ctx) => {
    return await ctx.db.query("onboardingTags").collect();
  },
});
