"use client";

import { authClient } from "@/lib/auth/auth-client";
import { setUser as SentrySetUser } from "@sentry/nextjs";
import { useEffect } from "react";

export const SentryIdentify = () => {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      SentrySetUser({
        id: session.user.id,
        email: session.user.email,
        username: session.user.name,
      });
    }
  }, [session]);

  return null;
};
