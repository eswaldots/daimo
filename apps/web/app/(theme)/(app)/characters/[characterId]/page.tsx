import CharacterView from "@/components/characters/character-view";
import * as Sentry from "@sentry/nextjs";
import { getToken } from "@/lib/auth/auth-server";
import { api, Id } from "@daimo/backend";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ characterId: Id<"characters"> }>;
};

/**
 * Build page metadata using the character's name from route params.
 *
 * Fetches the character by ID from the provided route params and returns a Metadata
 * object with the page title formatted as "<character name> - Daimo".
 * If the character is not found, invokes `notFound()` to render a 404 page.
 *
 * @param params - Promise that resolves to route params containing `characterId`
 * @returns Metadata with `title` set to "<character name> - Daimo"
 */
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const { characterId } = await params;

  // fetch data
  //
  try {
    const character = await fetchQuery(api.characters.getById, {
      characterId,
    });

    if (!character) {
      return {
        title: "Personaje no encontrado | Daimo",
      };
    }

    return {
      title: `${character.name} | Daimo`,
    };
  } catch (e) {
    return {
      title: "Error en el servidor | Daimo",
    };
  }
}

/**
 * Render the character page for the given characterId by preloading its data and mounting CharacterView.
 *
 * If the character cannot be loaded or preloading fails, triggers a 404 via `notFound()`.
 *
 * @param params - A promise that resolves to an object containing `characterId` (Id<"characters">)
 * @returns The page React element rendering `CharacterView` with the preloaded character
 */
export default async function Page({ params }: Props) {
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
  } catch (e) {
    Sentry.captureException(e);

    notFound();
  }
}
