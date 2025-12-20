import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  characters: defineTable({
    creatorId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    prompt: v.string(),
    shortDescription: v.string(),
    description: v.optional(v.string()),
    firstMessagePrompt: v.string(),
    voiceId: v.string(),
    ttsProvider: v.string(),
  }).index("by_creator_id", ["creatorId"]),
});
