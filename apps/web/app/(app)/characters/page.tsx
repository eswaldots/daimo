"use client";
import { SearchIcon } from "lucide-react";
import {
  CharacterCard,
  CharacterCardSkeleton,
} from "@/components/characters/character-card";
import { api } from "@daimo/backend";
import { useMutation, usePaginatedQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EmptyCharacter } from "@/components/layout/home/empty-character";

export default function Page() {
  const { isLoading, results } = usePaginatedQuery(
    api.characters.getMyCharacters,
    {},
    { initialNumItems: 20 },
  );

  return (
    <>
      <div className="grid gap-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring" }}
          className="tracking-tight text-2xl font-semibold"
        >
          Mis personajes
        </motion.h1>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <InputGroup className="hover:bg-input transition-colors dark:bg-border/80 border-0 rounded-full py-6 px-4 h-9 max-w-md">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar personajes"
            className="md:text-sm text-sm"
          />
        </InputGroup>
      </motion.div>

      <motion.div className="flex flex-wrap gap-4">
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
