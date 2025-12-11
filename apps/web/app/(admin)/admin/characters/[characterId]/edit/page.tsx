import CreateCharacterPage from "@/components/characters/create-character";
import { getVoices } from "@/lib/voices";
import { api, Id } from "@daimo/backend";
import { fetchQuery } from "convex/nextjs";

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<{ limit?: string; q?: string }>;
  params: Promise<{ characterId: Id<"characters"> }>;
}) {
  const options = await searchParams;
  const { characterId } = await params;

  const character = await fetchQuery(api.characters.getById, { characterId });

  if (!character) {
    throw new Error("Character not found");
  }

  const { data: voices } = await getVoices(options);

  return <CreateCharacterPage voices={voices} defaultValues={character} />;
}
