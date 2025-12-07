"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@daimo/backend";
import { usePaginatedQuery } from "convex/react";
import { motion } from "motion/react";
import { Doc } from "../../../../packages/backend/convex/_generated/dataModel";
import Image from "next/image";

export function CharacterCardSkeleton() {
  return (
    <Card className="bg-secondary h-82 dark:bg-border/80 border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
      <CardHeader className="px-4">
        <Skeleton className="w-full h-48 rounded-xl bg-background dark:bg-accent" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-1/2 bg-background dark:bg-accent" />
        <Skeleton className="h-3 w-full bg-background dark:bg-accent" />
        <Skeleton className="h-3 w-full bg-background dark:bg-accent" />
        <Skeleton className="h-3 w-full bg-background dark:bg-accent" />
      </CardContent>
    </Card>
  );
}

export function CharacterCard(
  props: Doc<"characters"> & { storageUrl?: string | null },
) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring" }}
    >
      <Card className="h-82 bg-secondary dark:bg-border/80 border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
        <CardHeader className="px-4 rounded-xl">
          <Image
            src={props.storageUrl ?? ""}
            alt="image"
            width={1028}
            height={1028}
            className="rounded-xl h-48 object-cover"
          />
        </CardHeader>

        <CardContent className="space-y-2">
          <CardTitle>{props.name}</CardTitle>
          <CardDescription className="truncate text-balance">
            {props.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Page() {
  const { isLoading, results } = usePaginatedQuery(
    api.characters.getMyCharacters,
    {},
    { initialNumItems: 4 },
  );

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
        {isLoading ? (
          <>
            <CharacterCardSkeleton />

            <CharacterCardSkeleton />

            <CharacterCardSkeleton />

            <CharacterCardSkeleton />
          </>
        ) : (
          results &&
          results.map((result) => (
            <CharacterCard {...result} key={result._id} />
          ))
        )}
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
