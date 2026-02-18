"use node";

import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
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
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): boolean {
  const hashBuffer = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  return timingSafeEqual(hashBuffer, storedHashBuffer);
}
