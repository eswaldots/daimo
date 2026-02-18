import { defineTable } from "convex/server";
import { v } from "convex/values";
import { EMBEDDING_DIMENSION } from "./llm";

export const conversationFields = {
  // optional because it sets at the end of the conversation
  title: v.optional(v.string()),
  isLive: v.boolean(),
  characterId: v.id("characters"),
  userId: v.string(),
  profileId: v.id("profile"),
};

export const messageFields = {
  content: v.string(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  conversationId: v.id("conversations"),
};

export const memoryFields = {
  displayDescription: v.string(),
  parentDescription: v.optional(v.string()),
  embeddingId: v.id("memoryEmbeddings"),
  importance: v.number(),
  userId: v.string(),
  profileId: v.id("profile"),
  characterId: v.optional(v.string()),
  lastAccess: v.number(),
  data: v.union(
    // Setting up dynamics between players
    v.object({
      type: v.literal("relationship"),
      // The player this memory is about, from the perspective of the player
      // whose memory this is.
      userId: v.string(),
    }),
    v.object({
      type: v.literal("conversation"),
      conversationId: v.id("conversations"),
    }),
    v.object({
      type: v.literal("reflection"),
      relatedMemoryIds: v.array(v.id("memories")),
    }),
  ),
};

export const agentSchema = {
  conversations: defineTable(conversationFields)
    .index("userId", ["userId"])
    .index("profileId", ["profileId"])
    .index("isLive", ["isLive"]),
  messages: defineTable(messageFields).index("conversationId", [
    "conversationId",
  ]),
  memories: defineTable(memoryFields)
    .index("embeddingId_characterId", ["embeddingId", "characterId"])
    .index("characterId_userId_type", ["userId", "data.type"])
    .index("userId_characterId", ["userId", "characterId"])
    .index("profileId_characterId", ["profileId", "characterId"])
    .index("profileId_characterId_importance", [
      "profileId",
      "characterId",
      "importance",
    ])
    .index("userId", ["userId"]),
  memoryEmbeddings: defineTable({
    userId: v.string(),
    characterId: v.optional(v.string()),
    profileId: v.id("profile"),
    embedding: v.array(v.float64()),
  }).vectorIndex("embedding", {
    vectorField: "embedding",
    filterFields: ["userId", "characterId", "profileId"],
    dimensions: EMBEDDING_DIMENSION,
  }),
  embeddingsCache: defineTable({
    textHash: v.bytes(),
    embedding: v.array(v.float64()),
  }).index("text", ["textHash"]),
};
