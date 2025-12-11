"use client";

import * as React from "react";
import { Track } from "livekit-client";
import { useTrackToggle } from "@livekit/components-react";
import { cn } from "@/lib/utils";
import { Mic, MicOff, MonitorUp, VideoIcon, VideoOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";

function getSourceIcon(
  source: Track.Source,
  enabled: boolean,
  pending = false,
) {
  if (pending) {
    return Spinner;
  }

  switch (source) {
    case Track.Source.Microphone:
      return enabled ? Mic : MicOff;
    case Track.Source.Camera:
      return enabled ? VideoIcon : VideoOff;
    case Track.Source.ScreenShare:
      return MonitorUp;
    default:
      return React.Fragment;
  }
}

export type TrackToggleProps = React.ComponentProps<typeof Toggle> & {
  source: Parameters<typeof useTrackToggle>[0]["source"];
  pending?: boolean;
};

export function TrackToggle({
  source,
  pressed,
  pending,
  className,
  ...props
}: TrackToggleProps) {
  const IconComponent = getSourceIcon(source, pressed ?? false, pending);

  return (
    <Toggle
      pressed={pressed}
      aria-label={`Toggle ${source}`}
      className={cn(className)}
      {...props}
    >
      <IconComponent className={cn(pending && "animate-spin")} />
      {props.children}
    </Toggle>
  );
}
