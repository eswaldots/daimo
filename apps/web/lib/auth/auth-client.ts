import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    convexClient(),
    inferAdditionalFields({
      user: {
        completedOnboarding: {
          type: "boolean",
          defaultValue: false,
        },
      },
    }),
  ],
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
});
