"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { useVoicePreview } from "@/hooks/use-voice-preview";
import { Voice } from "@/lib/voices";
import { Pause, Play } from "lucide-react";

export function VoiceItem(voice: Voice) {
  const { handlePlay, isLoading, isPlaying } = useVoicePreview();

  return (
    <Item
      key={voice.id}
      variant="muted"
      className="rounded-2xl items-center flex dark:bg-border bg-secondary"
    >
      <ItemMedia variant="icon" className="border-0 my-auto bg-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="dark:bg-transparent"
          onClick={() => handlePlay(voice.id)}
        >
          {isLoading ? (
            <Spinner className="size-6 text-muted-foreground" />
          ) : isPlaying ? (
            <Pause className="size-6 fill-muted-foreground text-muted-foreground" />
          ) : (
            <Play className="size-6 fill-muted-foreground text-muted-foreground" />
          )}
        </Button>
      </ItemMedia>
      <ItemContent className="gap-0">
        <ItemTitle className="text-base">{voice.name}</ItemTitle>
        <ItemDescription className="text-sm">{voice.language}</ItemDescription>
      </ItemContent>
      {/*<ItemActions>
        <Button
          variant="outline"
          className="rounded-full"
          size="sm"
          aria-label="Invite"
        >
          Usar voz
        </Button>
      </ItemActions>*/}
    </Item>
  );
}

export function SelectableVoiceItem(voice: Voice) {
  const { handlePlay, isLoading, isPlaying } = useVoicePreview();

  return (
    <Item
      key={voice.id}
      variant="muted"
      className="rounded-2xl items-center flex bg-background group hover:bg-secondary cursor-pointer"
    >
      <ItemMedia variant="icon" className="border-0 my-auto bg-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="dark:bg-transparent rounded-full cursor-pointer"
          onClick={() => handlePlay(voice.id)}
        >
          {isLoading ? (
            <Spinner className="size-6 text-muted-foreground" />
          ) : isPlaying ? (
            <Pause className="size-6 fill-muted-foreground text-muted-foreground" />
          ) : (
            <Play className="size-6 fill-muted-foreground text-muted-foreground" />
          )}
        </Button>
      </ItemMedia>
      <ItemContent className="gap-0">
        <ItemTitle className="text-base">{voice.name}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button
          className="rounded-full group-hover:opacity-100 opacity-0 cursor-pointer"
          aria-label="Invite"
        >
          Usar voz
        </Button>
      </ItemActions>
    </Item>
  );
}
