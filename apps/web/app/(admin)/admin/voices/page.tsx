import { Button } from "@/components/ui/button";
import { getVoicesFromGoogle } from "@/lib/voices";
import SearchInput from "@/components/layout/search-input";
import VoiceList from "@/components/voices/voice-list";
import CreateVoiceForm from "@/components/voices/create-voice";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; q?: string }>;
}) {
  const options = await searchParams;
  const { voices } = await getVoicesFromGoogle(options);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-2xl font-medium tracking-tight">Voces</h1>

        <CreateVoiceForm>
          <Button className="rounded-full">Crear voz</Button>
        </CreateVoiceForm>
      </div>

      <SearchInput placeholder="Buscar voces" />

      {voices && <VoiceList voices={voices} />}
      {/*<div key="empty" className="w-full">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="dark:bg-border">
              <AudioLines />
            </EmptyMedia>
            <EmptyTitle className="text-2xl">Crea una voz</EmptyTitle>
            <EmptyDescription>
              No has creado ninguna voz, crea tu primer voz para asignarla a un
              personaje
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateVoiceForm>
              <Button className="rounded-full" size="lg">
                <Plus />
                Crear voz
              </Button>
            </CreateVoiceForm>
          </EmptyContent>
        </Empty>
      </div>*/}
    </div>
  );
}
