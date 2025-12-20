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
import { toast } from "sonner";

/**
 * Render a list item that displays a voice and provides a play/pause preview control.
 *
 * @param voice - Voice object whose `displayName` and `langCode` are shown and whose `voiceId` is used to preview audio
 * @returns A JSX element representing the voice item with a play/pause button and descriptive text
 */
export function VoiceItem(voice: Voice) {
  const { handlePlay, isLoading, isPlaying } = useVoicePreview();

  return (
    <Item
      key={voice.name}
      variant="muted"
      className="rounded-2xl items-center flex dark:bg-border bg-secondary"
    >
      <ItemMedia variant="icon" className="border-0 my-auto bg-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="dark:bg-transparent"
          onClick={async () => await handlePlay(voice.voiceId)}
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
        <ItemTitle className="text-base">{voice.displayName}</ItemTitle>
        <ItemDescription className="text-sm">{voice?.langCode}</ItemDescription>
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

/**
 * Renders a selectable voice list item with a play/pause control, language indicator, and a "Usar voz" action button.
 *
 * The play control uses the preview hook for non-"gemini" voices and plays a generated sample URL for voices with `source === "gemini"`, updating play state via the hook's actions.
 *
 * @param voice - Voice entry to render (uses `name`, `displayName`, `voiceId`, `source`, `langCode`, and `description`)
 * @returns A JSX element representing the selectable voice item with playback and action affordances
 */
export function SelectableVoiceItem(voice: Voice) {
  const { handlePlay, isLoading, isPlaying, actions } = useVoicePreview();

  return (
    <Item
      key={voice.name}
      variant="muted"
      className="rounded-2xl items-center flex bg-background group hover:bg-secondary cursor-pointer"
    >
      <ItemMedia variant="icon" className="border-0 my-auto bg-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="dark:bg-transparent rounded-full cursor-pointer"
          onClick={async (e) => {
            if (voice.source === "gemini") {
              e.stopPropagation();
              const audio = new Audio(
                `https://gstatic.com/aistudio/voices/samples/${voice.displayName}.wav`,
              );

              actions.setIsPlaying(true);
              await audio.play();

              audio.addEventListener("ended", () => {
                actions.setIsPlaying(false);
              });

              return;
            }

            e.stopPropagation();
            handlePlay(voice.voiceId);
          }}
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
        <ItemTitle className="text-base">{voice.displayName}</ItemTitle>
        <ItemDescription>
          {voice?.langCode && voice?.langCode?.toLowerCase().includes("en")
            ? "🇺🇸"
            : voice?.langCode?.toLowerCase().includes("es")
              ? "🇪🇸"
              : "Multilingual"}
          {""} {voice.description && "-"} {voice.description}
        </ItemDescription>
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