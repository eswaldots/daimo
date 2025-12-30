import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { apiKeyFields } from "./schema";
import { GenericQueryCtx } from "convex/server";
import { DataModel } from "../_generated/dataModel";

// TODO: THIS SHOULD BE HANDLED BY A ADMIN ON THE ADMIN DASHBOARD
//
const { key, ...rest } = apiKeyFields;

const PREFIX = "dm";
const LENGTH = 32;

export const createApiKey = internalAction({
  args: rest,
  handler: async (ctx, args) => {
    const key = generateApiKey(LENGTH);

    await ctx.runMutation(internal.auth.apiKey.createMutation, {
      ...args,
      key,
    });

    return {
      ...args,
      key,
    };
  },
});

export const createMutation = internalMutation({
  args: apiKeyFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("apiKeys", { ...args });
  },
});

const generateApiKey = (byteLength: number) => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(byteLength));
  const key = btoa(String.fromCharCode(...new Uint8Array(randomBytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const keyWithPrefix = `${PREFIX}_${key}`;

  return keyWithPrefix;
};

export const verify = internalQuery({
  args: {
    key: v.string(),
  },
  handler: async (ctx, { key }) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (!apiKey) return false;

    if (!apiKey.expires) return true;

    if (apiKey.expires + apiKey._creationTime < Date.now()) return false;

    return true;
  },
});

// helper to call the query upside without to much syntax
export const verifyApiKey = async (
  ctx: GenericQueryCtx<DataModel>,
  key: string,
) => {
  return await ctx.runQuery(internal.auth.apiKey.verify, { key });
};
