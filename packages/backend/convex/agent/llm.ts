import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { generateText, Output } from "ai";
import z from "zod";
import { groq } from "@ai-sdk/groq";
import { internal } from "../_generated/api";

export const EMBEDDING_DIMENSION = 3072;

export const generateTitle = internalAction({
  args: {
    conversationId: v.id("conversations"),
    context: v.string(),
  },
  handler: async (ctx, args) => {
    const { output } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      output: Output.object({
        name: "title",
        schema: z.object({
          title: z.string().describe("El titulo de la conversacion"),
        }),
      }),
      system: `Eres un analista de memoria para una IA. Tu misión es extraer información valiosa.
      TU MISIÓN:

      Basado en los ultimos mensajes de la conversacion, necesito que crees un titulo descriptivo para esta.
    `,
      prompt: `
      ULTIMOS MENSAJES: "${args.context}"

      Analiza los ultimos mensajes para poder dar un titulo que llame la atención de usuario
      `,
    });

    await ctx.runMutation(internal.agent.conversation.updateConversationTitle, {
      title: output.title,
      conversationId: args.conversationId,
    });
  },
});
