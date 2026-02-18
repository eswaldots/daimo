import { Button } from "@/components/ui/button";
import { getVoices, getSupportedProviders } from "@/lib/voices";
import SearchInput from "@/components/layout/search-input";
import VoiceList from "@/components/voices/voice-list";
import CreateVoiceForm from "@/components/voices/create-voice";

/**
 * Renders the admin "Voces" page with controls to create, search, and list voices.
 *
 * @param searchParams - A promise resolving to query options object (may include `limit` and `q`) used to fetch voices
 * @returns The page's JSX containing the title, a create-voice button wrapped by CreateVoiceForm (provided with supported providers), a search input, and a VoiceList when voices are available
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; q?: string }>;
}) {
  const options = await searchParams;
  const { voices } = await getVoices(options);
  const supportedProviders = await getSupportedProviders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-2xl font-medium tracking-tight">Voces</h1>

        <CreateVoiceForm supportedProviders={supportedProviders}>
          <Button className="rounded-full">Crear voz</Button>
        </CreateVoiceForm>
      </div>

      <SearchInput placeholder="Buscar voces" />

      {voices && <VoiceList voices={voices} />}
    </div>
  );
}