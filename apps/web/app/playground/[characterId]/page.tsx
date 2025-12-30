import { headers } from "next/headers";
import { getAppConfig } from "@/lib/utils";
import { preloadQuery } from "convex/nextjs";
import { Playground } from "@/components/playground/playground";
import { api, Id } from "@daimo/backend";

export default async function Page({
  params,
}: {
  params: Promise<{ characterId: Id<"characters "> }>;
}) {
  const { characterId } = await params;
  const query = await preloadQuery(api.characters.getById, { characterId });

  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <Playground preloadedCharacter={query} appConfig={appConfig} />;
}
