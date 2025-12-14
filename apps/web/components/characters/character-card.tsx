"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { Doc } from "../../../../packages/backend/convex/_generated/dataModel";
import Image from "next/image";
import { AudioLines, Pause, Play } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useVoicePreview } from "@/hooks/use-voice-preview";
import { Spinner } from "../ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";

export function CharacterCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <Card className="bg-transparent h-86 border-0 shadow-none w-full md:w-74 rounded-2xl px-0 gap-2 py-4">
        <CardHeader className="px-0">
          <Skeleton className="w-full h-64 rounded-lg bg-background dark:bg-border" />
        </CardHeader>

        <CardContent className="space-y-2 px-0">
          <Skeleton className="h-5 w-1/2 bg-background dark:bg-border" />
          <Skeleton className="h-3 w-full bg-background dark:bg-border" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

const playVariants = {
  initial: {
    scale: 0,
  },
  animate: {
    scale: 1,
  },
  exit: {
    scale: 0,
  },
};

export function CharacterCard(
  props: Doc<"characters"> & { storageUrl?: string | null },
) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring" }}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Card className="group px-0 bg-transparent duration-300 cursor-pointer transition-colors border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
              <CardHeader className="px-0 rounded-lg relative">
                <motion.picture>
                  <Image
                    src={props.storageUrl ?? ""}
                    alt="image"
                    width={1028}
                    height={1028}
                    className="rounded-lg h-64 object-cover object-[50%_25%]"
                  />
                </motion.picture>
                <div className="group-hover:opacity-100 opacity-0 transition-all h-64 rounded-lg bg-black/20 absolute inset-0">
                  <Button
                    className="backdrop-blur-lg bg-black/50 absolute left-2 bottom-2 text-white rounded-full hover:bg-white hover:text-black cursor-pointer"
                    size="icon-sm"
                    asChild
                  >
                    <Link href={`/playground/${props._id}/`}>
                      <AudioLines />
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 truncate px-0">
                <CardTitle>
                  <div className="flex items-center w-full justify-between hover:underline">
                    {props.name}
                  </div>
                </CardTitle>
                <CardDescription className="text-balance max-h-16">
                  {props.shortDescription}
                </CardDescription>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent
            className="outline-0 ring-0 border-0 px-0 pt-0 pb-0"
            showCloseButton={false}
          >
            <CharacterContent {...props} />
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring" }}
      className="w-full"
    >
      <Drawer>
        <DrawerTrigger asChild>
          <Card className="group px-0 bg-transparent duration-300 cursor-pointer transition-colors border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
            <CardHeader className="px-0 rounded-lg relative">
              <motion.picture>
                <Image
                  src={props.storageUrl ?? ""}
                  alt="image"
                  width={1028}
                  height={1028}
                  className="rounded-xl h-72 object-cover object-[50%_25%]"
                />
              </motion.picture>
              <div className="group-hover:opacity-100 opacity-0 transition-all h-64 rounded-lg bg-black/20 absolute inset-0">
                <Button
                  className="backdrop-blur-lg bg-black/50 absolute left-2 bottom-2 text-white rounded-full hover:bg-white hover:text-black cursor-pointer"
                  size="icon-sm"
                  asChild
                >
                  <Link href={`/playground/${props._id}/`}>
                    <AudioLines />
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="md:space-y-2 truncate px-0">
              <CardTitle>
                <div className="flex items-center w-full justify-between hover:underline md:text-base text-lg">
                  {props.name}
                </div>
              </CardTitle>
              <CardDescription className="text-balance max-h-16 text-sm">
                {props.shortDescription}
              </CardDescription>
            </CardContent>
          </Card>
        </DrawerTrigger>
        <DrawerContent className="outline-0 ring-0 border-0 px-0 pt-0 pb-0 rounded-t-3xl">
          <CharacterContent {...props} />
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

function CharacterContent(
  props: Doc<"characters"> & { storageUrl?: string | null },
) {
  const { handlePlay, isLoading, isPlaying } = useVoicePreview();
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <DrawerTitle className="sr-only"></DrawerTitle>
      ) : (
        <DialogTitle className="sr-only">{props.name}</DialogTitle>
      )}
      {isMobile && (
        <div className="absolute right-1/2 translate-x-1/2 bg-white/50 backdrop-blur-lg mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
      )}
      <div className="h-72 w-full">
        <motion.picture
          layoutId={`image-${props._id}`}
          key={`image-${props._id}`}
        >
          <Image
            src={props.storageUrl ?? ""}
            width={2000}
            height={2000}
            alt={props.name}
            className="object-cover object-[50%_50%] h-96 rounded-t-3xl"
          />
        </motion.picture>
      </div>
      <div className="my-2 z-10 w-full p-6 rounded-b-3xl h-full relative bg-background space-y-4">
        <div>
          <motion.div
            className="flex items-center gap-3"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            <motion.h1 className="text-3xl font-medium text-balance tracking-tight text-foreground z-20">
              {props.name}
            </motion.h1>

            <Button
              size="icon-lg"
              variant="secondary"
              className="cursor-pointer z-20 rounded-full relative"
              onClick={async () => {
                await handlePlay(props.voiceId, props.firstMessagePrompt);
              }}
            >
              <AnimatePresence initial={false}>
                {isLoading ? (
                  <motion.div
                    key="loading"
                    {...playVariants}
                    className="absolute"
                  >
                    <Spinner className="size-5 text-foreground z-20" />
                  </motion.div>
                ) : !isPlaying ? (
                  <motion.div
                    key="play"
                    {...playVariants}
                    className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                  >
                    <Play className="fill-foreground text-foreground size-5 z-20" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pause"
                    {...playVariants}
                    className="absolute"
                  >
                    <Pause className="fill-foreground text-foreground size-5 z-20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        <motion.p
          className="mt-2 text-muted-foreground flex items-center justify-end gap-2 z-20  max-w-full leading-relaxed"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            delay: 0.4,
          }}
        >
          {props.description}
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-end gap-2 z-20"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            delay: 0.6,
          }}
        >
          <Button
            className="w-full rounded-full z-20 text-base"
            asChild
            size="lg"
          >
            <Link href={`/playground/${props._id}`}>
              <AudioLines />
              Conversar
            </Link>
          </Button>
        </motion.div>
      </div>
    </>
  );
}
