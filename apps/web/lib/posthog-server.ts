import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

/**
 * Lazily initializes and returns the singleton PostHog client configured from environment variables.
 *
 * If the client has not yet been created, this function constructs it using NEXT_PUBLIC_POSTHOG_KEY and
 * NEXT_PUBLIC_POSTHOG_HOST; in development it also enables client debug mode.
 *
 * @returns The singleton PostHog client instance
 */
export function getPostHogClient() {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
    if (process.env.NODE_ENV === "development") {
      posthogClient.debug(true);
    }
  }
  return posthogClient;
}

/**
 * Shuts down the singleton PostHog client if it has been initialized.
 *
 * If a PostHog client exists, waits for its shutdown to complete; otherwise does nothing.
 */
export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}