"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@daimo/backend";
import { useMutation, usePaginatedQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import { Doc } from "../../../../../packages/backend/convex/_generated/dataModel";
import Image from "next/image";
import { EmptyCharacter } from "@/components/layout/home/empty-character";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { EllipsisVertical, Trash } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { CharacterCard } from "@/components/characters/character-card";

export function CharacterCardSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
      <div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring" }}
          className="tracking-tight text-2xl font-semibold"
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

      {/*<div className="flex items-baseline justify-between">
        <motion.h1
          className="text-lg md:py-0 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Tus personajes recientes
        </motion.h1>

        <motion.h1
          className="text-sm md:py-0 py-4 hover:underline md:block hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Link href="/characters">Ver todos los personajes</Link>
        </motion.h1>
      </div>*/}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-4"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <>
              <CharacterCardSkeleton key="1" />

              <CharacterCardSkeleton key="2" />

              <CharacterCardSkeleton key="3" />

              <CharacterCardSkeleton key="4" />
            </>
          ) : (
            results &&
            results.map((result) => (
              <CharacterCard {...result} key={result._id} />
            ))
          )}
          {/*{!isLoading && results.length === 0 && <EmptyCharacter />}*/}
        </AnimatePresence>
      </motion.div>

      {/* <motion.h1 */}
      {/*   className="text-xl font-medium tracking-tight md:py-0 py-4" */}
      {/*   initial={{ opacity: 0 }} */}
      {/*   animate={{ opacity: 1 }} */}
      {/* > */}
      {/*   Populares */}
      {/* </motion.h1> */}
      {/**/}
      {/* <motion.div */}
      {/*   initial={{ opacity: 0 }} */}
      {/*   animate={{ opacity: 1 }} */}
      {/*   className="flex flex-wrap gap-4" */}
      {/* > */}
      {/*   <CharacterCardSkeleton /> */}
      {/**/}
      {/*   <CharacterCardSkeleton /> */}
      {/**/}
      {/*   <CharacterCardSkeleton /> */}
      {/**/}
      {/*   <CharacterCardSkeleton /> */}
      {/* </motion.div> */}
    </>
  );
}
