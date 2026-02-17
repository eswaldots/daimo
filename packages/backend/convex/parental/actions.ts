"use node";

import { createHash, randomBytes } from "node:crypto";
import { ConvexError, v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const hashPin = internalAction({
  args: {
    password: v.string(),
  },
  handler: async (_, { password }) => {
    const salt = randomBytes(16).toString("hex");

    const hash = hashPassword(password, salt);

    return { hash, salt };
  },
});

export const verifyPin = internalAction({
  args: {
    password: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { password, userId }) => {
    const pin = await ctx.runQuery(internal.parental.security.getPinByUser, {
      userId,
    });

    if (!pin) {
      throw new ConvexError("User doesn't have pin");
    }

    const havesPin = verifyPassword(password, pin?.pinSalt, pin?.pinHash);

    return havesPin;
  },
});

function hashPassword(password: string, salt: string) {
  const hash = createHash("sha256");

  hash.update(salt);
  hash.update(password);

  return hash.digest("hex");
}

function verifyPassword(password: string, salt: string, storedHash: string) {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
}
