import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getMyCharacters = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unautenticado");
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_creator_id", (q) =>
        q.eq("creatorId", user.subject as string),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const charactersWithUrl = await Promise.all(
      characters.page.map(async (c) => ({
        ...c,
        storageUrl: await ctx.storage.getUrl(c.storageId),
      })),
    );

    return { ...characters, page: charactersWithUrl };
  },
});

export const deleteCharacter = mutation({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unautenticado");
    }

    const character = await ctx.db.get(characterId);

    if (!character) {
      throw new ConvexError("Personaje no encontrado");
    }

    if (character?.creatorId !== user.subject) {
      throw new ConvexError("No eres dueño de este personaje");
    }

    await ctx.storage.delete(character.storageId);
    return await ctx.db.delete(characterId);
  },
});
