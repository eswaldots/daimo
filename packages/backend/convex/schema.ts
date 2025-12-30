import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { parentalSchema } from "./parental/schema";
import { authSchema } from "./auth/schema";

export default defineSchema({
  characters: defineTable({
    creatorId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    prompt: v.string(),
    shortDescription: v.string(),
    description: v.optional(v.string()),
    origin: v.union(v.literal("community"), v.literal("official")),
    accessType: v.union(v.literal("free"), v.literal("premium")),
    firstMessagePrompt: v.string(),
    voiceId: v.string(),
    ttsProvider: v.string(),
  })
    .searchIndex("search_by_name", { searchField: "name" })
    .index("by_creator_id", ["creatorId"]),
  stars: defineTable({
    starredBy: v.string(),
    starredCharacter: v.id("characters"),
  }).index("by_user_and_character_id", ["starredBy", "starredCharacter"]),
  subscriptions: defineTable({
    // Por ahora los planes son solo objetos estaticos
    planId: v.string(),
    userId: v.string(),
    status: v.union(v.literal("active"), v.literal("expired")),
    startsAt: v.number(),
    endsAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),
  tags: defineTable({
    name: v.string(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_by_name", { searchField: "name" }),
  characterTags: defineTable({
    characterId: v.id("characters"),
    tagId: v.id("tags"),
  }).index("by_character_and_tag", ["characterId", "tagId"]),
  onboardingTags: defineTable({
    name: v.string(),
    icon: v.string(),
    tagsId: v.array(v.id("tags")),
  }),
  ...parentalSchema,
  ...authSchema,
});
