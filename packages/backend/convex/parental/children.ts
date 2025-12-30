import { v } from "convex/values";
import { internalQuery, mutation } from "../_generated/server";
import { getAll } from "convex-helpers/server/relationships";
import { childrenFields } from "./schema";
import { authComponent } from "../auth";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";

export const getByFatherId = internalQuery({
		args: { fatherId: v.string() },
		handler: async (ctx, { fatherId }): Promise<Doc<"childrens"> | null> => {
return await ctx.db.query("childrens").withIndex(
						"by_father_id", q => q.eq("fatherId", fatherId)
				).unique()

		}
}) 

export const getChildrenTags = internalQuery({
		args: { childrenId: v.id("childrens") },
		handler: async (ctx, { childrenId }): Promise<(Doc<"tags"> | null)[] | null> => {
				const links = await ctx.db.query("childrenTags").withIndex(
						"by_children_id", q => q.eq("childrenId", childrenId)
						// TODO: review if a collect is needed
				).collect()

				if (!links) {
						return null
				}

				const tagsIds = links.map((tag) => tag.tagId);

				const tags = await getAll(ctx.db, tagsIds)

				return tags
		}
}) 

const { likes, fatherId, ...childrenFieldsWithoutFatherId }  = childrenFields;

export const createChildren = mutation({
		args: childrenFieldsWithoutFatherId,
		handler: async (ctx, args) => {
				const user = await authComponent.getAuthUser(ctx);

				if (!user) {
						throw new Error("No autenticado")
				}

				const existing = await ctx.runQuery(internal.parental.children.getByFatherId, { fatherId: user._id});

				if (existing) throw new Error("No puedes tener más de un hijo registrado");

				return await ctx.db.insert("childrens", { ...args, fatherId: user._id})
		}
})
