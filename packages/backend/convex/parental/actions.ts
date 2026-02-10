"use node";

import { createHash, randomBytes } from "node:crypto";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";

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

function hashPassword(password: string, salt: string) {
  // Create hash object
  const hash = createHash("sha256");

  // Update with salt and password
  hash.update(salt);
  hash.update(password);

  // Return digest
  return hash.digest("hex");
}

function verifyPassword(password: string, salt: string, storedHash: string) {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
}
