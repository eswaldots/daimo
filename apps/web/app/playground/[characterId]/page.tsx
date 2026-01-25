import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { getAppConfig } from "@/lib/utils";
import { preloadQuery } from "convex/nextjs";
import { Playground } from "@/components/playground/playground";
import { api, Id } from "@daimo/backend";
import { notFound } from "next/navigation";
import { createToken } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ characterId: Id<"characters">; isFirstTime?: boolean }>;
}) {
  const { characterId, isFirstTime } = await params;
  try {
    const query = await preloadQuery(api.characters.getById, { characterId });
    const hdrs = await headers();
    const appConfig = await getAppConfig(hdrs);
    const data = await createToken({
      characterId: characterId,
      isFirstTime: !!isFirstTime,
    });

    return (
      <Playground
        preloadedCharacter={query}
        appConfig={appConfig}
        tokenSource={{
          serverUrl: process.env.LIVEKIT_URL!,
          participantToken: data.participantToken,
        }}
      />
    );
  } catch (e) {
    Sentry.captureException(e);

    notFound();
  }
}
