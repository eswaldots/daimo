import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { ConvexError } from "convex/values";

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
