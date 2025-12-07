"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";

export function CharacterCardSkeleton() {
  return (
    <Card className="bg-secondary dark:bg-border/80 border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
      <CardHeader className="px-4">
        <Skeleton className="w-full h-48 rounded-xl bg-background dark:bg-accent" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-1/2 bg-background dark:bg-accent" />
        <Skeleton className="h-4 w-full bg-background dark:bg-accent" />
      </CardContent>
    </Card>
  );
}

export default function Page() {
  return (
    <>
      <div className="space-y-1">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring" }}
          className="tracking-tight text-3xl font-semibold"
        >
          Inicio
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Selecciona un personaje para comenzar una conversación
        </motion.p>
      </div>

      <motion.h1
        className="text-xl font-medium tracking-tight md:py-0 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tus personajes
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-4"
      >
        <CharacterCardSkeleton />

        <CharacterCardSkeleton />

        <CharacterCardSkeleton />

        <CharacterCardSkeleton />
      </motion.div>

      <motion.h1
        className="text-xl font-medium tracking-tight md:py-0 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Populares
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-4"
      >
        <CharacterCardSkeleton />

        <CharacterCardSkeleton />

        <CharacterCardSkeleton />

        <CharacterCardSkeleton />
      </motion.div>
    </>
  );
}
