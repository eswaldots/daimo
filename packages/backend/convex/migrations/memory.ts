import { generateText, Output } from "ai";
import { z } from "zod";
import { authComponent } from "../auth";
import { internal } from "../_generated/api";
import { groq } from "@ai-sdk/groq";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { v } from "convex/values";

const selfInternal = internal.migrations.memory;

export const setDisplayDescription = internalAction({
  handler: async (ctx) => {
    const memories = await ctx.runQuery(selfInternal.getAllMemories);

    Promise.all(
      memories.map(async (memory) => {
        const { output } = await generateText({
          model: groq("openai/gpt-oss-120b"),
          output: Output.object({
            name: "evaluation",
            schema: z.object({
              parentDescription: z
                .string()
                .describe(
                  "El dato en segunda persona. PARA QUE EL PADRE LO LEA",
                ),
              displayDescription: z
                .string()
                .describe("El dato en segunda persona"),
            }),
          }),
          system: `Eres un analista de memoria para una IA. Tu misión es extraer información valiosa.
      TU MISIÓN:
      Dada una string de un recuerdo, tendras que crear un objeto que tan el mismo hecho de la memoria, convirtiendola en segunda persona, y otra segunda persona para que el padre lo lea.

      **Ejemplo**:
      \`input:\` Al usuario le gusta la pizza
      \`output:\` {
	      "parentDescription": "A tu hijo le gusta la pizza"
	      "displayDescription": "Te gusta la pizza"
      }
    `,
          prompt: `
      INPUT DEL USUARIO: "${memory.description}"
      
      Analiza el input para poder crear el objeto
      `,
        });

        const { displayDescription, parentDescription } = output;

        const user = await authComponent.getAnyUserById(ctx, memory.userId);

        if (!user) return;

        const hasChildren = await ctx.runQuery(
          internal.parental.children.getByFatherId,
          { fatherId: user._id },
        );

        await ctx.runMutation(selfInternal.pathMemory, {
          _id: memory._id,
          displayDescription: displayDescription,
          from: !!hasChildren ? "children" : "user",
          // si no tiene hijo la memoria es de el no del hijo
          parentDescription: !!hasChildren ? parentDescription : undefined,
        });
      }),
    );
  },
});

export const getAllMemories = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("memories").collect();
  },
});

export const pathMemory = internalMutation({
  args: {
    _id: v.id("memories"),
    from: v.union(v.literal("children"), v.literal("user")),
    displayDescription: v.string(),
    parentDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
      ...args,
    });
  },
});
