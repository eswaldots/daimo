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
        Genera 10 etiquetas de búsqueda internas para el personaje de IA de voz: "${character.name}".
        Descripción: "${character.description}"

        REGLAS DE ORO PARA EL BUSCADOR:
        1. Incluye SINÓNIMOS (ej: si es robot, pon 'bot', 'androide', 'ia').
        2. Incluye INTENCIÓN (ej: 'aprender', 'compañia', 'tarea', 'jugar').
        3. Incluye ATRIBUTOS DE VOZ (ej: 'calma', 'aguda', 'robotica').
        4. Solo minúsculas, sin acentos ni caracteres especiales.
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
