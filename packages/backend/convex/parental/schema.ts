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

export const parentalSchema = {
  profile: defineTable(profileFields).index("by_user_id", ["userId"]),
  parentalSecurity: defineTable(parentalSecurityFields).index("by_user_id", [
    "userId",
  ]),
  profileTags: defineTable({
    profileId: v.id("profile"),
    tagId: v.id("tags"),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_and_tag", ["profileId", "tagId"]),
};
