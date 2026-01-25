"use client";

import { useMemo } from "react";
import { TokenSource, TokenSourceLiteral } from "livekit-client";
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from "@livekit/components-react";
import type { AppConfig } from "@/app-config";
import { getSandboxTokenSource } from "@/lib/utils";
import { Toaster } from "../ui/sonner";
import { ViewController } from "./view-controller";
import { useDebugMode } from "@/hooks/use-debug";
import { useAgentErrors } from "@/hooks/use-agent-errors";
import { useParams, useSearchParams } from "next/navigation";
import { Preloaded } from "convex/react";
import { api } from "@daimo/backend";

const IN_DEVELOPMENT = process.env.NODE_ENV !== "production";

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
  preloadedCharacter: Preloaded<typeof api.characters.getById>;
  tokenSource: { serverUrl: string; participantToken: string };
}

export function Playground({
  appConfig,
  preloadedCharacter,
  tokenSource,
}: AppProps) {
  const token = useMemo(() => {
    return TokenSource.literal(tokenSource);
  }, [tokenSource]);

  const session = useSession(token);

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController
          appConfig={appConfig}
          preloadedCharacter={preloadedCharacter}
        />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
