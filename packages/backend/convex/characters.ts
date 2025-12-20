import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { authComponent } from "./auth";

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
      .order("desc")
      .paginate(args.paginationOpts);

    const charactersWithUrl = await Promise.all(
      characters.page.map(async (c) => ({
        ...c,
        storageUrl: c.storageId
          ? await ctx.storage.getUrl(c.storageId as Id<"_storage">)
          : undefined,
      })),
    );

    return { ...characters, page: charactersWithUrl };
  },
});

export const getById = query({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);

    if (!character) {
      return character;
    }

    const characterWithUrl = {
      ...character,
      storageUrl: character.storageId
        ? await ctx.storage.getUrl(character.storageId as Id<"_storage">)
        : undefined,
    };

    return characterWithUrl;
  },
});

export const create = mutation({
  args: {
    creatorId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    prompt: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    firstMessagePrompt: v.string(),
    voiceId: v.string(),
    ttsProvider: v.optional(v.string()),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new Error("User not authorized");
    }

    return await ctx.db.insert("characters", { ...args });
  },
});

export const editCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    creatorId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    prompt: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    firstMessagePrompt: v.string(),
    voiceId: v.string(),
    ttsProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new Error("User not authorized");
    }

    const { characterId, ...rest } = args;

    await ctx.db.patch(characterId, { ...rest });
  },
});

export const deleteCharacter = mutation({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const character = await ctx.db.get(args.characterId);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new Error("User not authorized");
    }

    if (!character) {
      throw new Error("Character not found");
    }

    if (character.storageId) {
      await ctx.storage.delete(character.storageId);
    }

    await ctx.db.delete(character._id);
  },
});
