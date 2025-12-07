import { ConvexError, v } from "convex/values";
import { z } from "zod/v3";
import { action, internalMutation } from "./_generated/server";
import {
  generateObject,
  experimental_generateImage as generateImage,
} from "ai";
import { google } from "@ai-sdk/google";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const create = action({
  args: {
    description: v.string(),
  },
  returns: v.id("characters"),
  handler: async (ctx, { description }): Promise<Id<"characters">> => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unautorizado. Inicie sesión primero");
    }

    const { object: character } = await generateObject({
      model: google("gemini-2.5-flash"),
      prompt: `
      Generate a character that will be use for a AI that haves to adopt the identity of the character with the given description. There is the description of the
      character:

      <description>
      ${description}
      </description>
      `,
      output: "object",
      schema: z.object({
        name: z.string().describe("The name of the character"),
        description: z
          .string()
          .describe(
            "The description of the character (used mainly as a prompt)",
          ),
        voicePrompt: z
          .string()
          .describe("The prompt of voice of the character"),
        firstMessagePrompt: z.string().describe("The first message of the AI"),
      }),
    });

    const { image } = await generateImage({
      model: google.image("imagen-3.0-generate-002"),
      prompt: `Create a image WITH TRANSPARENT BACKGROUND of this character:

      <character>
      ${JSON.stringify(character)}
      </character>

      `,
      aspectRatio: "16:9",
    });

    const binaryString = atob(image.base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: image.mediaType });

    const storageId = await ctx.storage.store(blob);

    return await ctx.runMutation(internal.characters.internalCreate, {
      ...character,
      storageId,
      creatorId: user.subject as string,
    });
  },
});

export const internalCreate = internalMutation({
  args: {
    creatorId: v.string(),
    name: v.string(),
    description: v.string(),
    storageId: v.id("_storage"),
    voicePrompt: v.string(),
    firstMessagePrompt: v.string(),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("characters", { ...args });
  },
});
