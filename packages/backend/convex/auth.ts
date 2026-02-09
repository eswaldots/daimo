import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { api, components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { localization } from "better-auth-localization";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { admin, createAuthMiddleware } from "better-auth/plugins";
import authSchema from "./betterAuth/schema";
import authConfig from "./auth.config";
import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    user: {
      additionalFields: {
        completedOnboarding: {
          type: "boolean",
          defaultValue: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await requireRunMutationCtx(ctx).runMutation(
              internal.parental.profile.createInternalProfile,
              {
                isOwner: true,
                media: user.image ?? undefined,
                name: user.name,
                userId: user.id,
              },
            );
          },
        },
      },
    },
    session: {
      additionalFields: {
        activeProfileId: {
          type: "string",
          required: false,
        },
      },
    },
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      admin(),
      localization({
        defaultLocale: "es-ES",
        fallbackLocale: "default",
      }),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
