import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import logger from "@daimo/logger";

const { NEXT_PUBLIC_CONVEX_SITE_URL, NEXT_PUBLIC_CONVEX_URL } = process.env;

if (!NEXT_PUBLIC_CONVEX_SITE_URL) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_CONVEX_SITE_URL",
  );
}

if (!NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_CONVEX_URL",
  );
}



export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: NEXT_PUBLIC_CONVEX_URL,
  convexSiteUrl: NEXT_PUBLIC_CONVEX_SITE_URL,
});
