"use client";

import { AnimatePresence, motion, MotionProps } from "motion/react";
import { useSessionContext } from "@livekit/components-react";
import type { AppConfig } from "@/app-config";
import { SessionView } from "./session-view";
import { WelcomeView } from "./welcome-view";
import { toast } from "sonner";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@daimo/backend";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Mic, Mic2 } from "lucide-react";
import { Button } from "../ui/button";

const MotionWelcomeView = motion.create(WelcomeView);
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

  const checkMicPermission = async () => {
    try {
      // Consultamos el estado específicamente para el micrófono
      const status = await navigator.permissions.query({ name: "microphone" });

      if (status.state === "granted") {
        start();
      } else {
        setTimeout(() => {
          setModal(true);
        }, 1000);
      }
    } catch (error) {
      return "prompt"; // Por si acaso, asumimos que hay que preguntar
    }
  };

  useEffect(() => {
    checkMicPermission();
  }, []);

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
                } catch {
                  toast.error(
                    "Debes dar permiso para que Daimo pueda acceder a tu microfono para poder usar la aplicación.",
                  );
                }
              }}
              variant="accent"
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
