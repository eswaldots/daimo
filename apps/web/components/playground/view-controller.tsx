"use client";

import { AnimatePresence, motion, MotionProps } from "motion/react";
import { useSessionContext } from "@livekit/components-react";
import type { AppConfig } from "@/app-config";
import { SessionView } from "./session-view";
import { WelcomeView } from "./welcome-view";

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
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();

  return (
    <AnimatePresence mode="wait">
      {/* Welcome view */}
      {!isConnected && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={start}
        />
      )}
      {/* Session view */}
      {isConnected && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          appConfig={appConfig}
        />
      )}
    </AnimatePresence>
  );
}
