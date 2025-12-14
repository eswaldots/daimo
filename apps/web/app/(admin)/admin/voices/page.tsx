import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import CreateVoiceForm from "@/components/voices/create-voice";
import { getVoices, Voice } from "@/lib/voices";
import SearchInput from "@/components/layout/search-input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  SelectableVoiceItem,
  VoiceItem,
} from "@/components/layout/admin/voice-item";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; q?: string }>;
}) {
  const options = await searchParams;
  const { voices } = await getVoices(options);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-2xl font-medium tracking-tight">Voces</h1>

        <Button className="rounded-full">Crear voz</Button>
      </div>

      <SearchInput placeholder="Buscar voces" />

      <div className="text">
        <ItemGroup className="space-y-4">
          {voices?.map((voice) => (
            <VoiceItem {...voice} key={voice.name} />
          ))}
        </ItemGroup>
      </div>
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
