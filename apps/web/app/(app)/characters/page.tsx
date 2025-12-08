"use client";
import {
  ArrowUpRightIcon,
  PlusIcon,
  SearchIcon,
  User2Icon,
  UserCircle,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CreateCharacter } from "@/components/layout/home/create-character";
import { EmptyCharacter } from "@/components/layout/home/empty-character";

export function CharacterCardSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-secondary h-86 dark:bg-border/80 border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
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

export function CharacterCard(
  props: Doc<"characters"> & { storageUrl?: string | null },
) {
  const deleteCharacter = useMutation(api.characters.deleteCharacter);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      await deleteCharacter({
        characterId: props._id,
      });

      setIsOpen(false);

      toast.success("Personaje eliminado correctamente");
    } catch {
      toast.error("Hubo un error al eliminar el personaje");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring" }}
    >
      <Card className="h-86 bg-secondary dark:bg-border/80 border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
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
          <CardTitle>
            <div className="flex items-center w-full justify-between">
              {props.name}
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="-mr-4">
                    <Button size="icon-sm" variant="ghost">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DialogTrigger asChild>
                      <DropdownMenuItem variant="destructive">
                        <Trash />
                        Eliminar personaje
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>Eliminar a {props.name}</DialogTitle>
                    <DialogDescription>
                      Estas seguro de que quieres eliminar al personaje{" "}
                      <strong>{props.name}</strong>?
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost" className="rounded-full">
                        Atrás
                      </Button>
                    </DialogClose>

                    <Button
                      variant="destructive"
                      className="rounded-full"
                      disabled={isLoading}
                      onClick={handleClick}
                    >
                      {isLoading && <Spinner />}
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
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
        <InputGroup className="bg-secondary  hover:bg-input transition-colors dark:bg-border/80 border-0 rounded-full py-6 px-4 h-9">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar personajes"
            className="md:text-base text-sm"
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
