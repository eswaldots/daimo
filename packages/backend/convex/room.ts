// export only a function that needs all the info from convex to get working the room
// this is because convex functions lives within the data layer, so convex is too fast querying all the data in a one function in the backend, it can be slower to call multiple calls to fetch the neccesary information

import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { verifyApiKey } from "./auth/apiKey";
import { authComponent } from "./auth";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { ConvexUser } from "./betterAuth/types";

type ReturnValue = {
  user: ConvexUser;
  children: Doc<"childrens"> | null;
  childrenTags: string[];
  character: Doc<"characters">;
};

export const getMetadataRoom = query({
  args: {
    key: v.string(),
    characterId: v.id("characters"),
    userId: v.string(),
  },
  handler: async (ctx, { key, characterId, userId }): Promise<ReturnValue> => {
    const isValidKey = await verifyApiKey(ctx, key);

    if (!isValidKey) throw new ConvexError("apiKey invalida o expirada");

    const character = await ctx.db.get(characterId);

    if (!character) {
      throw new ConvexError("Personaje no encontrado");
    }

    const user = await authComponent.getAnyUserById(ctx, userId);

    if (!user) {
      throw new ConvexError("Usuario no encontrado");
    }

    const children: Doc<"childrens"> | null = await ctx.runQuery(
      internal.parental.children.getByFatherId,
      { fatherId: user._id },
    );

    // if user doesn't have children only returns the user data
    if (!children) {
      return { user, character, childrenTags: [], children: null };
    }

    type Tag = Doc<"tags"> | null;

    const childrenTags: Tag[] | null = await ctx.runQuery(
      internal.parental.children.getChildrenTags,
      { childrenId: children._id },
    );

    if (!childrenTags) {
      return { children, user, childrenTags: [], character };
    }
    const mappedTags =
      childrenTags.filter((tag) => !!tag).map((tag) => tag.name) ?? [];

    return { children, user, childrenTags: mappedTags, character };
  },
});
