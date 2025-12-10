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
import { useMutation } from "convex/react";
import { motion } from "motion/react";
import { Doc } from "../../../../packages/backend/convex/_generated/dataModel";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AudioLines, EllipsisVertical, Trash } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";

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
      exit={{ opacity: 0 }}
      transition={{ type: "spring" }}
    >
      <Link href={`/playground/${props._id}/`}>
        <Card className="group px-0 dark:bg-border/50 duration-300 dark:hover:bg-foreground/5 cursor-pointer transition-colors border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
          <CardHeader className="px-0 rounded-lg relative">
            <Image
              src={props.storageUrl ?? ""}
              alt="image"
              width={1028}
              height={1028}
              className="rounded-lg h-64 object-cover object-[50%_25%]"
            />
            <div className="group-hover:opacity-100 opacity-0 transition-all h-64 rounded-lg bg-black/20 absolute inset-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-black/50 absolute left-2 bottom-2 text-white rounded-full hover:bg-white hover:text-black cursor-pointer"
                    size="icon-sm"
                  >
                    <AudioLines />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Empezar a conversar</TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 truncate px-0">
            <CardTitle>
              <div className="flex items-center w-full justify-between">
                {props.name}
                {/*<Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              </Dialog>*/}
              </div>
            </CardTitle>
            <CardDescription className="text-balance max-h-16">
              {props.shortDescription}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
