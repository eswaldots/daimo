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
  profile: Doc<"profile"> | null;
  profileTags: string[];
  character: Doc<"characters">;
  coreMemories: Doc<"memories">[];
};

export const getMetadataRoom = query({
  args: {
    apiKey: v.string(),
    characterId: v.id("characters"),
    profileId: v.id("profile"),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { apiKey: key, characterId, profileId, userId },
  ): Promise<ReturnValue> => {
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

    const profile = await ctx.db.get(profileId);

    if (!profile) {
      throw new ConvexError("There is no profile to show");
    }

    const coreMemories =
      (await ctx.runQuery(internal.agent.memory.getCoreMemories, {
        characterId: characterId,
        profileId: profile._id,
      })) ?? [];

    type Tag = Doc<"tags"> | null;

    const profileTags: Tag[] | null = await ctx.runQuery(
      internal.parental.profile.getProfileTags,
      { profileId: profile._id },
    );

    if (!profileTags) {
      return {
        profile: profile,
        user,
        profileTags: [],
        character,
        coreMemories,
      };
    }

    const mappedTags = profileTags
      .filter((tag): tag is Doc<"tags"> => !!tag)
      .map((tag) => tag.name);

    return {
      profile: profile,
      user,
      profileTags: mappedTags,
      character,
      coreMemories,
    };
  },
});
