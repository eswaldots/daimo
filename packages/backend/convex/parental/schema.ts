import { defineTable } from "convex/server";
import { v } from "convex/values";

export const profileFields = {
  userId: v.string(),
  name: v.string(),
  age: v.optional(v.number()),
  media: v.optional(v.string()),
  isOwner: v.boolean(),
  gender: v.optional(v.union(v.literal("niño"), v.literal("niña"))),
  // String to what the children likes
  likes: v.optional(v.string()),
};

export const parentalSecurityFields = {
  userId: v.string(),
  pinHash: v.string(),
  pinSalt: v.string(),
};

export const parentalTokenFields = {
  used: v.boolean(),
  expiresAt: v.number(),
  userId: v.string(),
};

export const interactionFlagsFields = {
  triggeredBy: v.union(v.literal("assistant"), v.literal("user")),
  status: v.union(
    v.literal("active"),
    v.literal("dismissed"),
    v.literal("false_positive"),
    v.literal("resolved"),
  ),
  reviewedAt: v.optional(v.number()),
  category: v.string(),
  severity: v.float64(),
  explanation: v.string(),
  conversationId: v.id("conversations"),
  profileId: v.id("profile"),
  messageId: v.id("messages"),
};

export const parentalSchema = {
  profile: defineTable(profileFields).index("by_user_id", ["userId"]),
  parentalSecurity: defineTable(parentalSecurityFields).index("by_user_id", [
    "userId",
  ]),
  interactionFlags: defineTable(interactionFlagsFields).index("profileId", [
    "profileId",
  ]),
  parentalToken: defineTable(parentalTokenFields),
  profileTags: defineTable({
    profileId: v.id("profile"),
    tagId: v.id("tags"),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_and_tag", ["profileId", "tagId"]),
};
