import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { authComponent } from "./auth";
import { internal } from "./_generated/api";

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

    let isStarredByUser: undefined | boolean = undefined;

    const user = await ctx.auth.getUserIdentity();

    if (user) {
      isStarredByUser = await ctx.runQuery(internal.stars.isStarringCharacter, {
        characterId: character._id,
        userId: user.subject,
      });
    }

    const characterWithUrl: Doc<"characters"> & {
      storageUrl?: string | null;
      isStarredByUser: undefined | boolean;
    } = {
      ...character,
      storageUrl: character.storageId
        ? await ctx.storage.getUrl(character.storageId as Id<"_storage">)
        : undefined,
      isStarredByUser,
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
    accessType: v.union(v.literal("free"), v.literal("premium")),
    firstMessagePrompt: v.string(),
    voiceId: v.string(),
    ttsProvider: v.string(),
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

    const id = await ctx.db.insert("characters", {
      ...args,
      origin: "official",
    });

    // Dejaremos en un segundo proceso que la IA vaya creando las tags del personaje
    await ctx.scheduler.runAt(
      0,
      internal.characters.internal.createTagsForCharacter,
      { characterId: id },
    );

    return id;
  },
});

export const editCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    creatorId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    accessType: v.union(v.literal("free"), v.literal("premium")),
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

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new Error("User not authorized");
    }

    const character = await ctx.db.get(args.characterId);

    if (!character) {
      throw new Error("Character not found");
    }

    if (character.storageId) {
      await ctx.storage.delete(character.storageId);
    }

    await ctx.db.delete(character._id);
  },
});
