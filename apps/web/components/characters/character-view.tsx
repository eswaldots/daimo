"use client";

import { api } from "@daimo/backend";
import Image from "next/image";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { notFound } from "next/navigation";
import { Button } from "../ui/button";
import { AudioLines, Heart, HeartPlus, PencilIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion } from "motion/react";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ClickSpark from "../ClickSpark";

export default function CharacterView({
  preloadedCharacter,
}: {
  preloadedCharacter: Preloaded<typeof api.characters.getById>;
}) {
  const { data: session, isPending } = authClient.useSession();

  const character = usePreloadedQuery(preloadedCharacter);

  if (!character) {
    notFound();
  }

  const [isStarred, setIsStarred] = useState(character.isStarredByUser);
  const starCharacter = useMutation(api.stars.starCharacter);
  const unstarCharacter = useMutation(api.stars.unstarCharacter);

  const toggleStarred = () => {
    setIsStarred(!isStarred);

    if (isStarred) {
      unstarCharacter({ characterId: character._id });
    } else {
      starCharacter({ characterId: character._id });
    }
  };

  return (
    <motion.section
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="absolute left-0 top-0 h-96 w-full">
        <div className="absolute inset-0 opacity-40" />

        <div className="flex flex-col items-start h-96 justify-center px-20 gap-18 z-20">
          <section className="flex items-center gap-24 w-full">
            <motion.div className="relative size-48">
              <Image
                src={character.storageUrl ?? ""}
                fill
                alt={character.name}
                className="object-cover object-[50%_25%] rounded-full"
              />
            </motion.div>
            <div className="z-10 flex flex-col gap-8">
              <motion.h1 className="tracking-tight font-medium text-5xl text-foreground">
                {character.name}
              </motion.h1>
              <div>
                <motion.p className="text-foreground/60 max-w-md">
                  {character.shortDescription}
                </motion.p>
              </div>
              <motion.div className="z-40 flex items-center gap-3">
                <Button
                  className="rounded-full z-40 border-primary border"
                  size="lg"
                >
                  <AudioLines />
                  {!isPending && !session
                    ? "Iniciar sesión para conversar"
                    : "Conversar"}
                </Button>
                <Button
                  className="rounded-full z-40 dark:bg-border dark:hover:bg-border/50"
                  variant="secondary"
                  size="icon-lg"
                  onClick={toggleStarred}
                >
                  <ClickSpark
                    sparkColor={
                      !isStarred ? "transparent" : "oklch(64.5% 0.246 16.439)"
                    }
                  >
                    <Heart
                      className={cn(
                        "transition-all",
                        isStarred
                          ? "fill-rose-500 text-rose-500"
                          : "dark:fill-border fill-secondary",
                      )}
                    />
                  </ClickSpark>
                </Button>
              </motion.div>
            </div>
          </section>
        </div>
        <motion.div className="mx-20">
          <Separator />
          <div className="my-6">
            <strong className="font-medium">Información del personaje</strong>

            <p className="my-4 max-w-3xl">{character.description}</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
