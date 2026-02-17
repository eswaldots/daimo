import CreateCharacterPage from "@/components/characters/create-character";
import { getVoices } from "@/lib/voices";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; q?: string }>;
}) {
  const options = await searchParams;
  const { voices } = await getVoices(options);

  return <CreateCharacterPage voices={voices} />;
}
