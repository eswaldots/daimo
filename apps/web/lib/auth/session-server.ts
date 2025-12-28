import logger from "@daimo/logger";
import { cache } from "react";
import { authClient } from "./auth-client";
import { headers } from "next/headers";

const log = logger.getSubLogger({ prefix: ["getServerSession"] });

export const getServerSession = cache(async () => {
		log.debug("Getting server session")
		const requestHeaders = await headers()

  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: requestHeaders,
    },
  });

  if (!session) {
		log.debug("User or session not found")

		return null
  }

  return session;
})
