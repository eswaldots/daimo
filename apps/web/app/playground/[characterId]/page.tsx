import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { getAppConfig } from "@/lib/utils";
import { preloadQuery } from "convex/nextjs";
import { Playground } from "@/components/playground/playground";
import { api, Id } from "@daimo/backend";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ characterId: Id<"characters"> }>;
}) {
  const { characterId } = await params;
  try {
    const query = await preloadQuery(api.characters.getById, { characterId });
    const hdrs = await headers();
    const appConfig = await getAppConfig(hdrs);

    return <Playground preloadedCharacter={query} appConfig={appConfig} />;
  } catch (e) {
    Sentry.captureException(e);

    notFound();
  }
}
