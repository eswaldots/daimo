"use client";

import { AnimatePresence, motion } from "motion/react";
import * as Sentry from "@sentry/nextjs";
import { StepDescription, StepTitle } from "../components/step";
import { Button } from "@/components/ui/button";
import { ElementType, JSX, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import HighEndCalibration from "../components/daimo";
import { useMutation } from "convex/react";
import { api, Id } from "@daimo/backend";
import { toast } from "sonner";

type Icon = {
  icon: ElementType<any, keyof JSX.IntrinsicElements> | undefined;
  name: string;
  tags: Id<"tags">[];
};

type Icons = Icon[];

export const ProfileTagsView = ({ icons }: { icons: Icons }) => {
  const [selectedTags, setSelectedTags] = useState<Icons>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const finishOnboarding = useMutation(api.auth.onboarding.finishOnboarding);
  const saveChildrenTags = useMutation(api.auth.onboarding.saveChildrenTags);

  return (
    <AnimatePresence mode="wait">
      {!isLoading ? (
        <motion.section
          key="form"
          className="flex flex-col gap-10 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="gap-4 grid text-center">
            <StepTitle>¿Qué le gusta a tu hijo/a?</StepTitle>
            <StepDescription>
              Ayúdanos a personalizar su experiencia dándonos detalles básicos
              de tu hijo/a
            </StepDescription>

            <motion.div
              className="w-full md:my-4 my-8 grid grid-cols-2 gap-x-4 gap-y-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                ease: "backOut",
                type: "spring",
                damping: 20,
              }}
            >
              {icons.map((icon) => (
                <div
                  key={icon.name}
                  onClick={() => {
                    if (selectedTags.includes(icon)) {
                      setSelectedTags([
                        ...selectedTags.filter((tag) => tag !== icon),
                      ]);

                      return;
                    }

                    setSelectedTags([...selectedTags, icon]);
                  }}
                >
                  <ProfileTag
                    key={icon.name}
                    {...icon}
                    isActive={selectedTags.includes(icon)}
                  />
                </div>
              ))}
            </motion.div>

            <motion.div
              className="w-full my-2 space-y-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.7,
                ease: "backOut",
                type: "spring",
                damping: 20,
              }}
            >
              <Button
                size="lg"
                disabled={selectedTags.length === 0 || isLoadingMutation}
                variant="accent"
                className="w-full text-base h-12"
                onClick={async () => {
                  try {
                    setIsLoadingMutation(true);

                    await saveChildrenTags({
                      tags: selectedTags.flatMap((tags) => tags.tags),
                    });

                    setIsLoading(true);
                  } catch (e) {
                    Sentry.captureException(e);

                    toast.error(
                      "Hubo un error intentando redirigirte a la pantalla de carga",
                    );
                  } finally {
                    setIsLoadingMutation(false);
                  }
                }}
              >
                Siguiente
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-base w-full h-12 dark:hover:bg-secondary"
                disabled={isLoadingMutation}
                onClick={async () => {
                  try {
                    setIsLoadingMutation(true);

                    await finishOnboarding();

                    setIsLoading(true);
                  } catch (e) {
                    Sentry.captureException(e);

                    toast.error(
                      "Hubo un error intentando redirigirte a la pantalla de carga",
                    );
                  } finally {
                    setIsLoadingMutation(false);
                  }
                }}
              >
                Omitir
              </Button>
            </motion.div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center gap-12 relative w-screen h-screen  bg-background"
        >
          <div className="flex gap-12 items-center">
            <HighEndCalibration />
          </div>

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff6400_1px,transparent_1px)]  [background-size:20px_20px]" />
        </motion.section>
      )}
    </AnimatePresence>
  );
};

const ProfileTag = ({ isActive, ...icon }: Icon & { isActive: boolean }) => {
  const animationRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  return (
    <div
      onMouseEnter={() => animationRef.current?.startAnimation()}
      onMouseLeave={() => animationRef.current?.stopAnimation()}
      key={`${icon.name}-${icon.icon}`}
      className={cn(
        "flex flex-col gap-6 items-center justify-center rounded-lg cursor-pointer border-border border w-full h-48 md:w-64 md:h-48 hover:bg-secondary transition-colors",
        isActive && "bg-accent/5 hover:bg-accent/5 border-accent text-accent",
      )}
    >
      <div className="[&_svg]:size-10 md:[&_svg]:size-16">
        {icon.icon && <icon.icon ref={animationRef} />}
      </div>
      <h1 className="text-base font-medium">{icon.name}</h1>
    </div>
  );
};
