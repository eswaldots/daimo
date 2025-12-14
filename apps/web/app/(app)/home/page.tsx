"use client";

import { api } from "@daimo/backend";
import { usePaginatedQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import {
  CharacterCard,
  CharacterCardSkeleton,
} from "@/components/characters/character-card";

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
          className="text-sm md:text-lg text-muted-foreground tracking-tight"
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
        className="flex flex-wrap md:gap-4 gap-0"
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
