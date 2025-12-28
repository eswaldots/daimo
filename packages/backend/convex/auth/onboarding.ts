// all of this are public functions to perform server tracking of the onboarding process

import { ConvexError } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";

// TODO: Don't use magic strings
export const checkOnboardingRedirect = query({
		handler: async (ctx) => {
				const user = await authComponent.getAuthUser(ctx);

				if (!user) {
						throw new ConvexError("No autenticado")
				}

				const children = await ctx.runQuery(internal.parental.children.getByFatherId, { fatherId: user._id});

				if (!children) {
						return "/onboarding/getting-started"
				}

				const childrenTags: (Doc<"tags"> | null)[] | null = await ctx.runQuery(internal.parental.children.getChildrenTags, { childrenId: children._id });

				if (!childrenTags || childrenTags?.length === 0) {
						return "/onboarding/profile-tags"
				}

				return "/onboarding/character-selection"
		}
})
