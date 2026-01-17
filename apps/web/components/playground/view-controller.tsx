"use client";

import { AnimatePresence, motion, MotionProps } from "motion/react";
import * as Sentry from "@sentry/nextjs";
import { useSessionContext } from "@livekit/components-react";
import type { AppConfig } from "@/app-config";
import { SessionView } from "./session-view";
import { toast } from "sonner";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@daimo/backend";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Mic } from "lucide-react";
import { Button } from "../ui/button";
import posthog from "posthog-js";

const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: "hidden",
  animate: "visible",
  exit: "hidden",
  transition: {
    duration: 0.5,
    ease: "linear",
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
  preloadedCharacter: Preloaded<typeof api.characters.getById>;
}

export function ViewController({
  appConfig,
  preloadedCharacter,
}: ViewControllerProps) {
  const { start } = useSessionContext();
  const character = usePreloadedQuery(preloadedCharacter);
  const [modal, setModal] = useState(false);

  const checkMicPermission = useCallback(async () => {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });

      if (status.state === "granted") {
        start();
      } else {
        setTimeout(() => {
          setModal(true);
        }, 1000);
      }
    } catch (error) {
      Sentry.captureException(error);

      setTimeout(() => {
        setModal(true);
      }, 1000);
    }
  }, [start]);

  useEffect(() => {
    checkMicPermission();
  }, [checkMicPermission]);

  return (
    <AnimatePresence mode="wait">
      <MotionSessionView
        key="session-view"
        {...VIEW_MOTION_PROPS}
        appConfig={appConfig}
      />
      <Dialog open={modal} onOpenChange={() => {}}>
        <DialogContent className="p-8 md:p-12" showCloseButton={false}>
          <DialogHeader className="space-y-8">
            <Mic className="size-24 text-accent mx-auto" />
            <div className=" space-y-2">
              <DialogTitle className="text-2xl font-semibold mx-auto text-center">
                {character?.name} necesita escucharte
              </DialogTitle>
              <DialogDescription className="mx-auto text-center text-base">
                Daimo necesita oir tu voz para poder comunicarse contigo, activa
                el micrófono y empieza a conversar con él
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button
              className="w-full h-12 text-base rounded-full"
              onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({
                    audio: true,
                  });

                  start();
                  setModal(false);
                } catch (e) {
                  Sentry.captureException(e);

                  posthog.capture("user_denied_micro_permission");

                  toast.error(
                    "Debes dar permiso para que Daimo pueda acceder a tu microfono para poder usar la aplicación.",
                  );
                }
              }}
              size="lg"
            >
              Conceder permisos de voz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}
