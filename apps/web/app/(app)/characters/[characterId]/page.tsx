import CharacterView from "@/components/characters/character-view";
import { getToken } from "@/lib/auth-server";
import { api, Id } from "@daimo/backend";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { Metadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ characterId: Id<"characters"> }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const { characterId } = await params;

  // fetch data
  //
  const character = await fetchQuery(api.characters.getById, {
    characterId,
  });

  if (!character) {
    notFound();
  }

  return {
    title: `${character.name} - Daimo`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ characterId: Id<"characters"> }>;
}) {
  const { characterId } = await params;

  const token = await getToken();

  try {
    const character = await preloadQuery(
      api.characters.getById,
      {
        characterId,
      },
      { token },
    );

    return <CharacterView preloadedCharacter={character} />;
  } catch {
    notFound();
  }
}
