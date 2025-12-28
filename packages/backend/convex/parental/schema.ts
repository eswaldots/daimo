import { defineTable } from "convex/server";
import { v } from "convex/values";

export const childrenFields = {
				fatherId: v.string(),
				name: v.string(),
				age: v.number(),
				gender: v.union(v.literal("niño"), v.literal("niña")),
				// String to what the children likes
				likes: v.optional(v.string())
}

export const parentalSchema = {
		childrens: defineTable(childrenFields).index("by_father_id", ["fatherId"]),
		childrenTags: defineTable({
				childrenId: v.id("childrens"),
				tagId: v.id("tags")
		}).index("by_children_id", ["childrenId"])
}
