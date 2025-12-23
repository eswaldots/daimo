import * as Sentry from "@sentry/nextjs";

/**
 * Initializes Sentry for the current Next.js runtime when running in production.
 *
 * Loads the server or edge Sentry configuration depending on `process.env.NEXT_RUNTIME`.
 * Does nothing if `process.env.NODE_ENV` is not "production".
 */
export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;