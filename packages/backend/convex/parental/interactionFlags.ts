import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { ErrorCode, RiskCategory } from "@daimo/lib";
import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { interactionFlagsFields } from "./schema";
import { messageFields } from "../agent/schema";
import { api, internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";

const selfInternal = internal.parental.interactionFlags;

export const evaluateRisk = internalAction({
  args: {
    _id: v.id("messages"),
    ...messageFields,
  },
  handler: async (ctx, { _id, content, role, conversationId }) => {
    const categories = Object.values(RiskCategory);

    const { output } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      system: `Eres un evaluador de riesgo en mensajes de una plataforma infantil sustentada por inteligencia artificial. Tu tarea es evaluar si el siguiente mensaje, supone un riesgo para el niño o la plataforma, deberás construir el siguiente objeto:

	        category: Categoriza el mensaje en las siguientes categorias: ${categories}
		severity: Un float del 0 al 5, evalua que tan peligroso fue el mensaje enviado
		explanation: Explica por que el mensaje enviado fue un mensaje peligroso

		ULTIMA ADVERTENCIA: Si crees que el mensaje realmente no representaba ningun peligro, haz que la severity sea de 0.0, de esa forma, el mensaje se considerara como no peligroso
      		`,
      prompt: `Evalua el siguiente mensaje, y verifica si representa un peligro real: ${role}:"${content}" `,
      output: Output.object({
        schema: z.object({
          category: z.string(),
          severity: z.float64().min(0.0).max(5.0),
          explanation: z.string(),
        }),
      }),
    });

    if (output.severity <= 0.0) {
      return;
    }

    const conversation: Doc<"conversations"> | null = await ctx.runQuery(
      api.agent.conversation.getConversationById,
      { id: conversationId },
    );

    if (!conversation) {
      throw new ConvexError({
        code: ErrorCode.NotFound,
      });
    }

    await ctx.runMutation(selfInternal.createInteractionFlag, {
      category: output.category,
      severity: output.severity,
      profileId: conversation.profileId,
      conversationId,
      messageId: _id,
      status: "active",
      explanation: output.explanation,
      triggeredBy: role,
    });
  },
});

export const createInteractionFlag = internalMutation({
  args: interactionFlagsFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("interactionFlags", args);
  },
});
