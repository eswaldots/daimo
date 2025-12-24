import { ConvexError, v } from "convex/values";
import { internalAction } from "../_generated/server";
import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import z from "zod";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const createTagsForCharacter = internalAction({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId }) => {
    const character = await ctx.runQuery(api.characters.getById, {
      characterId,
    });

    if (!character) {
      throw new ConvexError("The character has not founded");
    }

    const { output } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      output: Output.array({
        name: "tag",
        description: "La tag para el personaje",
        element: z.object({
          name: z
            .string()
            .describe(
              "El nombre de la tag, NO PUEDE CONTENER CARACTERES RAROS NI LETRAS EN MAYUSCULAS. Ej: robot",
            ),
        }),
      }),
      prompt: `
<context>
Tienes que crear 10 tags para el siguiente personaje: ${character.name} - ${character.description}
</context>
<tag_rules>
Las tags se usan para alimentar nuestro motor de busqueda para nuestra plataforma de personajes de IA conversacionales (parecido a character.ai), CREA LAS TAGS PENSANDO EN LOS POSIBLES PARAMETROS DE BUSQUEDA QUE USARA UNA PERSONA AL BUSCAR ESTE PERSONAJE.
</tag_rules>
`,
    });

    const promises = output.map(async ({ name }) => {
      const existing = await ctx.runQuery(internal.tags.internal.getTagByName, {
        name,
      });

      if (existing) {
        return;
      }

      const id: Id<"tags"> = await ctx.runMutation(
        internal.tags.internal.createTag,
        {
          name,
        },
      );

      await ctx.runMutation(internal.tags.internal.relateTag, {
        tagId: id,
        characterId: character._id,
      });
    });

    await Promise.all(promises);
  },
});
