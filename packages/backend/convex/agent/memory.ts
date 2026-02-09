import { embed, generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { asyncMap } from "convex-helpers";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { google } from "@ai-sdk/google";
import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { serverAction } from "../utils";
import { z } from "zod";
import { authComponent } from "../auth";

export const MEMORY_ACCESS_THROTTLE = 300_000;

const selfInternal = internal.agent.memory;

export const retrieve = serverAction({
  args: {
    userId: v.string(),
    characterId: v.id("characters"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const candidates = await ctx.vectorSearch("memoryEmbeddings", "embedding", {
      vector: (
        await embed({
          value: args.text,
          model: google.embeddingModel("gemini-embedding-001"),
        })
      ).embedding,
      filter: (q) => q.eq("userId", args.userId),
      limit: 20,
    });

    const rankedMemories: { memory: Doc<"memories"> }[] = await ctx.runMutation(
      selfInternal.rankAndTouchMemories,
      {
        candidates,
        characterId: args.characterId,
        n: 5,
      },
    );

    return rankedMemories.map(({ memory }) => memory);
  },
});

export const getDisplayMemories = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Unautorizado");
    }

    const coreMemories = await ctx.db
      .query("memories")
      .withIndex("userId_characterId_importance", (q) =>
        q
          .eq("userId", user._id)
          .eq("characterId", args.characterId)
          .gt("importance", 4),
      )
      .take(10);

    const merged = [...coreMemories];
    const unique = Array.from(new Map(merged.map((m) => [m._id, m])).values());

    return unique;
  },
});

export const getCoreMemories = internalQuery({
  args: { userId: v.string(), characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const coreMemories = await ctx.db
      .query("memories")
      .withIndex("userId_characterId_importance", (q) =>
        q
          .eq("userId", args.userId)
          .eq("characterId", args.characterId)
          .gt("importance", 8),
      )
      .take(10);

    const recentMemories = await ctx.db
      .query("memories")
      .withIndex("userId_characterId", (q) =>
        q.eq("userId", args.userId).eq("characterId", args.characterId),
      )
      .order("desc")
      .take(3);

    const merged = [...coreMemories, ...recentMemories];
    const unique = Array.from(new Map(merged.map((m) => [m._id, m])).values());

    return unique;
  },
});

function makeRange(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [min, max] as const;
}

function normalize(value: number, range: readonly [number, number]) {
  const [min, max] = range;

  if (max === min) return 1.0;

  return (value - min) / (max - min);
}

export const rankAndTouchMemories = internalMutation({
  args: {
    characterId: v.id("characters"),
    candidates: v.array(
      v.object({ _id: v.id("memoryEmbeddings"), _score: v.number() }),
    ),
    n: v.number(),
  },
  handler: async (ctx, args) => {
    const ts = Date.now();

    const relatedMemories = await asyncMap(args.candidates, async ({ _id }) => {
      const memory = await ctx.db
        .query("memories")
        .withIndex("embeddingId_characterId", (q) =>
          q.eq("embeddingId", _id).eq("characterId", args.characterId),
        )
        .first();

      if (!memory)
        throw new ConvexError(`Memory for embedding ${_id} not found`);

      return memory;
    });

    const recencyScore = relatedMemories.map((memory) => {
      const hoursSinceAccess = (ts - memory.lastAccess) / 1000 / 60 / 60;
      return 0.99 ** Math.floor(hoursSinceAccess);
    });
    const relevanceRange = makeRange(args.candidates.map((c) => c._score));
    const importanceRange = makeRange(relatedMemories.map((m) => m.importance));
    const recencyRange = makeRange(recencyScore);
    const memoryScores = relatedMemories.map((memory, idx) => ({
      memory,
      overallScore:
        // @ts-expect-error the index will be always accesed
        normalize(args.candidates[idx]._score, relevanceRange) +
        normalize(memory.importance, importanceRange) +
        // @ts-expect-error the index will be always accesed
        normalize(recencyScore[idx], recencyRange),
    }));
    memoryScores.sort((a, b) => b.overallScore - a.overallScore);
    const accessed = memoryScores.slice(0, args.n);
    await asyncMap(accessed, async ({ memory }) => {
      if (memory.lastAccess < ts - MEMORY_ACCESS_THROTTLE) {
        await ctx.db.patch(memory._id, { lastAccess: ts });
      }
    });
    return accessed;
  },
});

export const createMemory = serverAction({
  args: {
    userId: v.string(),
    conversationId: v.id("conversations"),
    characterId: v.string(),
    text: v.string(),
    lastAssistantMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const contextStr = args.lastAssistantMessage
      ? `CONTEXTO PREVIO (Lo que preguntó la IA): "${args.lastAssistantMessage}"`
      : "CONTEXTO PREVIO: No disponible (Inicio de conversación o silencio).";

    const [profile] = await ctx.runQuery(
      internal.parental.profile.getByUserId,
      { userId: args.userId },
    );

    const { output } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      output: Output.object({
        name: "evaluation",
        schema: z.object({
          should_save: z
            .boolean()
            .describe(
              "False si es charla trivial. True si hay info nueva valiosa.",
            ),
          fact: z
            .string()
            .describe(
              "El dato en SEGUNDA PERSONA. Si should_save es false, devuelve un string vacío ''. Ej: Te gusta jugar bolos",
            ),
          parentFact: z
            .string()
            .describe(
              "El dato en TERCERA PERSONA para que el padre del niño vea la memoria. Si should_save es false, devuelve un string vacío ''.",
            ),
          category: z
            .enum([
              "personal",
              "likes",
              "work",
              "relationship",
              "other",
              "none",
            ])
            .describe("Categoría del dato. Si no aplica, usa 'none'."),
          importance: z
            .number()
            .describe("Nivel 1-10. Si should_save es false, devuelve 0."),
        }),
      }),
      system: `Eres un analista de memoria para una IA. Tu misión es extraer información valiosa.
      TU MISIÓN:
      Decidir si el texto del usuario contiene información que vale la pena guardar a largo plazo.

      REGLAS DE FORMATO (CRÍTICO):
      1. Todos los campos del JSON son OBLIGATORIOS. 
      2. Si el usuario solo saluda o dice trivialidades:
         - should_save: false
         - fact: "" (string vacío)
         - importance: 0
         - category: "none"
      
      REGLAS DE CONTENIDO:
      1. Transforma a TERCERA PERSONA: "Soy enfermero" -> "El usuario es enfermero".
      2. Ignora saludos ("Hola"), confirmaciones cortas ("Vale", "Ok") o risas.
    `,
      prompt: `
      ${contextStr}
      
      INPUT DEL USUARIO: "${args.text}"
      ${profile?.name ? `USERNAME: ${profile.name}` : ""}
      
      Analiza la relación entre lo que preguntó la IA y lo que respondió el usuario para extraer el "fact".
      Ejemplo: Si IA pregunta "¿Tu color favorito?" y Usuario dice "Azul", el fact es "Tu color favorito es el azul" y el parentFact es "El color favorito de <USERNAME> es el azul".
      `,
    });

    if (!output?.should_save || !output?.fact) {
      console.log("Memoria descartada por trivialidad.");
      return;
    }

    const { fact, importance, parentFact } = output;

    const { embedding } = await embed({
      value: fact,
      model: google.embeddingModel("gemini-embedding-001"),
    });

    await ctx.runMutation(internal.agent.memory.insertMemoryMutation, {
      userId: args.userId,
      characterId: args.characterId,
      description: fact,
      from: profile ? "children" : "user",
      parentDescription: profile ? parentFact : undefined,
      importance: importance ?? 0,
      embedding: embedding,
      conversationId: args.conversationId,
    });
  },
});

export const insertMemoryMutation = internalMutation({
  args: {
    userId: v.string(),
    characterId: v.string(),
    from: v.optional(v.union(v.literal("children"), v.literal("user"))),
    description: v.string(),
    childrenId: v.optional(v.string()),
    parentDescription: v.optional(v.string()),
    importance: v.number(),
    embedding: v.array(v.float64()),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const embeddingId = await ctx.db.insert("memoryEmbeddings", {
      userId: args.userId,
      characterId: args.characterId,
      embedding: args.embedding,
    });

    await ctx.db.insert("memories", {
      userId: args.userId,
      characterId: args.characterId,
      from: args.from,
      displayDescription: args.description,
      childrenId: args.childrenId,
      parentDescription: args.parentDescription,
      embeddingId: embeddingId,
      importance: args.importance,
      lastAccess: Date.now(),
      data: { type: "conversation", conversationId: args.conversationId },
    });
  },
});

export const getByCharacter = query({
  args: {
    characterId: v.string(),
  },
  handler: async (ctx, { characterId }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Usuario no encontrado");
    }

    return await ctx.db
      .query("memories")
      .withIndex("userId_characterId", (q) =>
        q.eq("userId", user._id).eq("characterId", characterId),
      )
      .order("desc")
      .take(100);
  },
});

export const deleteMemory = mutation({
  args: {
    memoryId: v.id("memories"),
  },
  handler: async (ctx, { memoryId }) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Usuario no encontrado");
    }

    const memory = await ctx.db.get(memoryId);

    if (!memory || memory.userId !== user._id) {
      throw new ConvexError("No autorizado");
    }

    await Promise.all([
      ctx.db.delete(memory._id),
      ctx.db.delete(memory.embeddingId),
    ]);
  },
});
