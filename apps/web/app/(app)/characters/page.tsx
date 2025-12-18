"use client";
import { SearchIcon } from "lucide-react";
import {
  CharacterCard,
  CharacterCardSkeleton,
} from "@/components/characters/character-card";
import { api } from "@daimo/backend";
import { usePaginatedQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import { EmptyCharacter } from "@/components/layout/home/empty-character";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const { isLoading, results } = usePaginatedQuery(
    api.characters.getMyCharacters,
    {},
    { initialNumItems: 20 },
  );

  return (
    <>
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="grid gap-4">
          <motion.h1 className="tracking-tight text-3xl font-medium">
            Tus personajes
          </motion.h1>
        </div>

        <Button className="rounded-full" asChild>
          <Link href="/characters/create">Crear personaje</Link>
        </Button>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-4 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <AnimatePresence mode="wait">
          {isLoading && (
            <>
              <CharacterCardSkeleton key="1" />

              <CharacterCardSkeleton key="2" />

              <CharacterCardSkeleton key="3" />

              <CharacterCardSkeleton key="4" />
            </>
          )}
          {!isLoading && results.length === 0 && <EmptyCharacter />}
          {results &&
            results.map((result) => (
              <CharacterCard {...result} key={result._id} />
            ))}
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
