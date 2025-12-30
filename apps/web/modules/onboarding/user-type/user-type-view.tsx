"use client";

import { motion } from "motion/react";
import React, { useRef, useTransition } from "react";
import { StepTitle } from "../components/step";
import { useRouter } from "next/navigation";
import { BlocksIcon } from "../components/icons/animated-blocks";
import { RocketIcon } from "../components/icons/animated-rocket";
import { useMutation } from "convex/react";
import { api } from "@daimo/backend";
import { toast } from "sonner";

export const UserTypeView = () => {
  const [_, startTransition] = useTransition();
  const router = useRouter();
  const finishOnboarding = useMutation(api.auth.onboarding.finishOnboarding);

  return (
    <motion.section
      className="flex flex-col gap-10 items-center"
      exit={{ opacity: 0 }}
    >
      <div className="gap-2 grid text-center">
        <StepTitle>¿Quién usará Daimo?</StepTitle>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          ease: "backOut",
          type: "spring",
          damping: 20,
        }}
        className="flex md:flex-row flex-col items-center gap-4"
      >
        <UserCard
          title="Mi hijo/a"
          description="Configuración parental"
          icon={BlocksIcon}
          onClick={() => {
            startTransition(() => {
              router.push("/onboarding/profile-setup");
            });
          }}
        />
        <UserCard
          title="Yo"
          description="Para curiosos/experimentadores"
          icon={RocketIcon}
          onClick={() => {
            startTransition(async () => {
              try {
                await finishOnboarding();

                router.push("/home?isFirstTime=true");
              } catch {
                toast.error("Hubo un error intentando redirigirte al inicio");
              }
            });
          }}
        />
      </motion.div>
    </motion.section>
  );
};

type AnimationRef = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

function UserCard({
  title,
  description,
  onClick,
  ...props
}: {
  title: string;
  description: string;
  icon: React.FC<{ ref: RefObject<AnimationRef | null> }>;
  onClick: () => void;
}) {
  const animationRef = useRef<AnimationRef>(null);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => animationRef.current?.startAnimation()}
      onMouseLeave={() => animationRef.current?.stopAnimation()}
      className="relative rounded-2xl gap-6 transition-colors cursor-pointer h-50 md:h-64 w-72 hover:border-accent border-[1px] border-border shadow-none flex hover:bg-secondary items-center justify-center flex-col"
    >
      <div className="[&_svg]:size-16">
        <props.icon ref={animationRef} />
      </div>
      <div className="text-center">
        <h1 className="font-medium text-lg">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
