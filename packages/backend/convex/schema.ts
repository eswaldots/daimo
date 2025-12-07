import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  characters: defineTable({
    creatorId: v.string(),
    storageId: v.id("_storage"),
    name: v.string(),
    description: v.string(),
    voicePrompt: v.string(),
    firstMessagePrompt: v.string(),
  }),
});
