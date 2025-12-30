import { defineTable } from "convex/server"
import { v } from "convex/values"

export const apiKeyFields = {
		name: v.string(),
		key: v.string(),
		expires: v.optional(v.number()),
}

export const authSchema = {
		apiKeys: defineTable(apiKeyFields).index("by_key", ["key"])
}
