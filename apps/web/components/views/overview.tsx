"use client";

import { api } from "@daimo/backend";
import { usePaginatedQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import {
  CharacterCard,
  CharacterCardSkeleton,
} from "@/components/characters/character-card";

/**
 * Render an overview section with headings and personalized character recommendations.
 *
 * Displays a header and a "Recomendaciones para ti" subsection that shows character cards when data is available
 * or skeleton placeholders while the recommendations are loading.
 *
 * @returns A React element containing the overview headings and a list of character cards or skeleton placeholders.
 */
export function Overview() {
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
          transition={{ type: "spring", delay: 0.1 }}
          className="tracking-tight text-3xl font-semibold"
        >
          Inicio
        </motion.h1>
      </div>

      <div>
        <motion.h1
          className="text-xl pt-4 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Recomendaciones para ti
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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
      </div>

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