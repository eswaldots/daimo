"use client";

import { api } from "@daimo/backend";
import Markdown from "react-markdown";
import Image from "next/image";
import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  AudioWaveform,
  Brain,
  CheckIcon,
  Clock,
  Heart,
  LockIcon,
  LucideCardSim,
  Mic,
  MicVocal,
  SparklesIcon,
  User,
  XIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { motion, useScroll, useTransform } from "motion/react";
import { ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ClickSpark } from "../ClickSpark";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import DaimoIcon from "../icons/daimo";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";

/**
 * Renders the character profile view including hero image, details, star and conversation actions, memory dialog, and premium upsell UI (modal or drawer).
 *
 * @param preloadedCharacter - A Convex preloaded query result for `api.characters.getById` used to read the character data.
 * @returns The React element representing the character profile page.
 */
export default function CharacterView({
  preloadedCharacter,
}: {
  preloadedCharacter: Preloaded<typeof api.characters.getById>;
}) {
  const { data: session, isPending } = authClient.useSession();

  const character = usePreloadedQuery(preloadedCharacter);

  if (!character) {
    notFound();
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isStarred = character.isStarredByUser;
  const starCharacter = useMutation(
    api.stars.starCharacter,
  ).withOptimisticUpdate((localStore) => {
    localStore.setQuery(
      api.characters.getById,
      { characterId: character._id },
      {
        ...character,
        isStarredByUser: true,
        starCount: character.starCount + 1,
      },
    );
  });
  const unstarCharacter = useMutation(
    api.stars.unstarCharacter,
  ).withOptimisticUpdate((localStore) => {
    localStore.setQuery(
      api.characters.getById,
      { characterId: character._id },
      {
        ...character,
        isStarredByUser: false,
        starCount: character.starCount - 1,
      },
    );
  });
  const router = useRouter();
  const isPremium = character.accessType === "premium";

  const toggleStarred = async () => {
    if (isStarred) {
      try {
        await unstarCharacter({ characterId: character._id });
      } catch {
        // TODO: Better this message
        toast.error(
          "Hubo un error desconocido intentando quitar el like del personaje",
        );
      }
    } else {
      try {
        await starCharacter({ characterId: character._id });
      } catch {
        toast.error(
          // TODO: Better this message
          "Hubo un error desconocido darle like del personaje",
        );
      }
    }
  };

  const container = useRef(null);
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });
  const isMobile = useIsMobile();

  const value = useTransform(scrollYProgress, [0, 1], ["0vh", "100vh"]);

  return (
    <motion.section
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="absolute left-0 top-0 md:h-96 w-full" ref={container}>
        <div className="absolute inset-0 z-20 backdrop-blur-3xl bg-black/20" />
        {/* TODO: storageUrl never has to be undefined or null */}
        {character.storageUrl && (
          <Image
            src={character.storageUrl}
            fill
            alt={character.name}
            className="object-cover object-[50%_25%] z-10 backdrop-blur-2xl sm:size-48 sm:flex hidden sm:bg-transparent"
          />
        )}
        <div className="md:bg-black/20 absolute inset-0 sm:backdrop-blur-2xl" />

        <div className="flex flex-col items-start md:pt-0 md:h-96 justify-center gap-4 md:gap-18 z-20">
          <section className="flex md:flex-row flex-col items-center gap-12 md:gap-12 w-full z-40 md:px-8 px-0">
            <div className="md:h-fit h-96 md:w-fit w-full relative">
              <motion.div
                className="relative w-full h-[27rem] md:size-48 md:aspect-square"
                style={{ y: isMobile ? value : undefined }}
              >
                {character.storageUrl && (
                  <Image
                    src={character.storageUrl}
                    width={2000}
                    height={2000}
                    alt={character.name}
                    className="object-cover absolute inset-0 md:object-[50%_25%] md:bg-secondary h-full md:size-48 bg-transparent md:rounded-full"
                  />
                )}
              </motion.div>
              <motion.h1 className="tracking-tight font-semibold text-4xl md:text-6xl text-white mr-auto -mb-8 z-30 flex md:hidden absolute left-4 bottom-0">
                {character.name}
              </motion.h1>
            </div>
            <div className="w-full md:bg-transparent bg-background z-20 -pt-4 px-4 md:px-0">
              <div className="z-10 flex flex-col gap-8 w-full md:py-0 py-2 pb-4">
                <div className="space-y-2">
                  <motion.h1 className="tracking-tight font-semibold text-4xl md:text-5xl text-white mr-auto mt-auto z-20 hidden md:flex">
                    {character.name}
                  </motion.h1>
                  <div className="flex items-center gap-4">
                    {isPremium && (
                      <div className="font-mono font-medium text-sm text-primary tracking-wide flex items-center flex-row gap-1 bg-background px-3.5 md:px-4 py-1 md:py-1.5 rounded-full">
                        <SparklesIcon className="size-3" />
                        PRO
                      </div>
                    )}
                  </div>
                  <motion.p className="text-foreground md:text-white/80 max-w-md font-medium md:text-xl text-base">
                    {character.shortDescription}
                  </motion.p>
                  <Dialog>
                    <DialogTrigger>
                      <motion.p className="text-foreground md:text-white/80 max-w-md text-sm hover:underline cursor-pointer">
                        Aún no te conoce
                      </motion.p>
                    </DialogTrigger>
                    <DialogContent className="md:max-w-2xl px-6 py-8 pt-10 md:p-16 rounded-3xl text-left">
                      <DialogHeader className="text-left">
                        <span className="text-foreground font-medium">
                          Memoria
                        </span>
                        <DialogTitle className="text-foreground text-3xl md:text-5xl leading-[1.1] font-semibold">
                          Lo que {character.name} recuerda sobre ti
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-1">
                        <DialogDescription className="tracking-tight text-lg md:text-xl font-medium text-foreground mt-6 md:mt-16">
                          Todavía no hay recuerdos guardados.
                        </DialogDescription>
                        <DialogDescription className="tracking-normal text-sm md:text-base text-foreground">
                          A medida de que hablen, Daimo ira guardando detalles
                          importantes para personalizar la experiencia.
                        </DialogDescription>
                      </div>
                      <DialogFooter className="mt-6 md:mt-16 flex items-start w-full">
                        <DialogClose asChild>
                          <Button className="rounded-full ml-auto">
                            Entendido
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <motion.div className="z-40 flex items-center gap-3 md:bg-transparent bg-background md:my-4">
                <Button
                  className="rounded-full z-40 border-primary border md:text-base text-primary-foreground text-base md:flex-0 flex-1"
                  size="lg"
                  onClick={() => {
                    if (!session) {
                      router.push("/sign-up");

                      return;
                    }

                    if (
                      isPremium &&
                      (!subscription || subscription?.planId === "free")
                    ) {
                      setIsDialogOpen(true);

                      return;
                    }
                    router.push(`/playground/${character._id}`);
                  }}
                >
                  {!subscription && isPremium ? <LockIcon /> : <Mic />}
                  {!isPending && !session
                    ? "Iniciar sesión para conversar"
                    : !subscription && isPremium
                      ? "Desbloquear"
                      : "Conversar"}
                </Button>
                <Button
                  className="rounded-full z-40 md:bg-white/50 md:dark:bg-border md:dark:hover:bg-border/50 md:p-3"
                  variant="secondary"
                  size="icon-lg"
                  onClick={toggleStarred}
                >
                  <ClickSpark
                    sparkColor={
                      !isStarred ? "transparent" : "oklch(64.5% 0.246 16.439)"
                    }
                  >
                    <Heart
                      className={cn(
                        "transition-all md:size-4 size-5",
                        isStarred
                          ? "fill-rose-500 text-rose-500"
                          : "dark:fill-border fill-transparent",
                      )}
                    />
                  </ClickSpark>
                </Button>
              </motion.div>
              <motion.div>
                <div className="my-6 md:my-12 md:hidden">
                  <Description>{character.description}</Description>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
        <motion.div className="md:block hidden">
          <div className="py-6 flex items-start px-20 justify-between">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-muted-foreground tracking-wider text-xs font-semibold">
                POPULARIDAD
              </span>
              <h1 className="text-2xl font-bold text-foreground/80 font-mono tracking-tighter">
                {character.starCount}
              </h1>

              <span className="text-muted-foreground text-xs -mt-1 tracking-wide">
                likes
              </span>
            </div>

            <div className="bg-muted-foreground/10 w-px h-16" />

            <div className="flex flex-col items-center space-y-2">
              {/* TODO: Count number of sessions of a character */}
              <span className="text-muted-foreground tracking-wider text-xs font-semibold">
                SESIONES
              </span>
              <h1 className="text-2xl text-foreground/80 font-bold font-mono tracking-tighter">
                -
              </h1>
              <span className="text-muted-foreground text-xs -mt-1">
                sesiones
              </span>
            </div>

            <div className="bg-muted-foreground/10 w-px h-16" />
            <div className="flex flex-col items-center space-y-2">
              <span className="text-muted-foreground tracking-wider text-xs font-semibold">
                VOZ
              </span>
              {character.ttsProvider === "gemini" ? (
                <AudioWaveform className="size-8 text-foreground/80" />
              ) : (
                <MicVocal />
              )}
              <span className="text-muted-foreground text-xs -mt-1">
                {character.ttsProvider === "gemini" ? "original" : "clonada"}
              </span>
            </div>

            <div className="bg-muted-foreground/10 w-px h-16" />
            <div className="flex flex-col items-center space-y-2">
              <span className="text-muted-foreground tracking-wider text-xs font-semibold">
                ESTADO
              </span>
              {character.origin === "official" ? (
                <CheckIcon className="size-8 text-foreground/80" />
              ) : (
                <User className="size-8 text-foreground/80" />
              )}
              <span className="text-muted-foreground text-xs -mt-1">
                {character.origin === "official"
                  ? "personaje oficial"
                  : "de la comunidad"}
              </span>
            </div>
          </div>

          <div className="mx-8 my-6 pb-8 flex items-start gap-16">
            <div className="flex-1">
              <div className="font-mono tracking-tighter text-xs uppercase font-semibold text-muted-foreground">
                Sobre el personaje
              </div>

              <div className="max-w-4xl prose prose-neutral prose-sm md:prose-sm w-full dark:prose-invert my-6 leading-relaxed">
                <Description>{character.description}</Description>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {isMobile ? (
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerContent>
            <ScrollArea className="flex flex-col items-center py-8 px-4 overflow-auto">
              <DrawerClose className="absolute right-4 top-6 p-1.5 rounded-full bg-secondary text-muted-foreground">
                <XIcon className="size-5" />
              </DrawerClose>
              <DrawerHeader>
                <motion.div
                  className="p-5 bg-foreground rounded-3xl w-fit mx-auto my-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, ease: "easeOut" }}
                >
                  <DaimoIcon className="text-background size-12" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, ease: "easeOut" }}
                >
                  <DrawerTitle className="font-semibold text-center text-3xl max-w-lg">
                    Desbloquea todos los personajes
                  </DrawerTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, ease: "easeOut" }}
                >
                  <DrawerDescription className="text-center text-sm my-3">
                    Unete a la version beta por solo $15 al mes — Cancela en
                    cualquier momento.
                  </DrawerDescription>
                </motion.div>
              </DrawerHeader>
              <motion.div
                className="my-4 flex flex-col items-center w-full gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, ease: "easeOut" }}
              >
                <div className="rounded-3xl w-full bg-secondary border border-secondary p-6 h-96">
                  <div className="flex items-center gap-2">
                    <h1 className="tracking-tight font-semibold text-xl">
                      Pro
                    </h1>

                    <div className="font-medium text-xs text-background tracking-wider flex items-center flex-row gap-1 bg-primary px-2.5 py-1 rounded-lg">
                      Popular
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm">
                    Para aprendices ambiciosos
                  </p>

                  <div className="my-4 flex items-baseline gap-1">
                    <h1 className="text-2xl font-bold">$15</h1>
                    <p className="text-xs text-muted-foreground">por mes</p>
                  </div>

                  <Button
                    className="my-2 rounded-full w-full"
                    size="lg"
                    asChild
                  >
                    <Link
                      href={`https://wa.me/584120196456?text=${encodeURI("Hola, estoy interesado en actualizarme a Daimo Pro")}`}
                      target="_blank"
                    >
                      Actualizar a pro
                    </Link>
                  </Button>

                  <div className="my-4 text-xs space-y-2">
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-3" />
                      15 horas de uso por mes
                    </li>
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <LucideCardSim className="size-3" />
                      Memoria de por vida
                    </li>
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <Brain className="size-3" />
                      Razonamiento avanzado
                    </li>
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <SparklesIcon className="size-3" />
                      Acceso a personajes PRO
                    </li>
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <Mic className="size-3" />
                      Clonación de voz
                    </li>
                  </div>
                </div>
                <div className="rounded-3xl w-full border border-border p-6 h-96">
                  <div className="flex items-center gap-2">
                    <h1 className="tracking-tight font-semibold text-xl">
                      Gratuito
                    </h1>
                  </div>

                  <p className="text-muted-foreground text-sm">
                    Para experimentadores
                  </p>

                  <div className="my-4 flex items-baseline gap-1">
                    <h1 className="text-2xl font-bold">$0</h1>
                  </div>

                  <Button
                    className="my-2 rounded-full w-full"
                    size="lg"
                    asChild
                    variant="secondary"
                  >
                    <Link
                      href={
                        "https://wa.me/04120196456?text='hola,estoyinteraso'"
                      }
                      target="_blank"
                    >
                      Continuar gratis
                    </Link>
                  </Button>

                  <div className="my-4 text-xs space-y-2">
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-3" />
                      30 minutos de uso por mes
                    </li>
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <LucideCardSim className="size-3" />
                      Memoria por sesión
                    </li>
                    <li className="list-none flex items-center gap-2 text-muted-foreground">
                      <SparklesIcon className="size-3" />
                      Acceso a personajes gratuitos
                    </li>
                  </div>
                </div>
              </motion.div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="md:max-w-5xl flex flex-col items-center py-16 px-32 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <motion.div
                className="p-5 bg-foreground rounded-3xl w-fit mx-auto my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, ease: "easeOut" }}
              >
                <DaimoIcon className="text-background size-14" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, ease: "easeOut" }}
              >
                <DialogTitle className="font-semibold text-center text-5xl max-w-lg">
                  Desbloquea todos los personajes
                </DialogTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, ease: "easeOut" }}
              >
                <DialogDescription className="text-center text-base my-4">
                  Unete a la version beta por solo $15 al mes — Cancela en
                  cualquier momento.
                </DialogDescription>
              </motion.div>
            </DialogHeader>
            <motion.div
              className="my-4 flex items-center w-full gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, ease: "easeOut" }}
            >
              <div className="rounded-3xl h-96 flex-1 border border-border p-6">
                <div className="flex items-center gap-2">
                  <h1 className="tracking-tight font-semibold text-2xl">
                    Gratuito
                  </h1>
                </div>

                <p className="text-muted-foreground">Para experimentadores</p>

                <div className="my-4 flex items-baseline gap-1">
                  <h1 className="text-3xl font-bold">$0</h1>
                </div>

                <Button
                  className="my-2 rounded-full w-full"
                  size="lg"
                  asChild
                  variant="secondary"
                >
                  <Link
                    href={"https://wa.me/04120196456?text='hola,estoyinteraso'"}
                    target="_blank"
                  >
                    Continuar gratis
                  </Link>
                </Button>

                <div className="my-4 text-sm space-y-2">
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    30 minutos de uso por mes
                  </li>
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <LucideCardSim className="size-4" />
                    Memoria por sesión
                  </li>
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <SparklesIcon className="size-4" />
                    Acceso a personajes gratuitos
                  </li>
                </div>
              </div>

              <div className="rounded-3xl h-96 flex-1 bg-secondary border border-secondary p-6">
                <div className="flex items-center gap-2">
                  <h1 className="tracking-tight font-semibold text-2xl">Pro</h1>

                  <div className="font-medium text-xs text-background tracking-wide flex items-center flex-row gap-1 bg-primary px-2.5 py-1 rounded-lg">
                    Popular
                  </div>
                </div>

                <p className="text-muted-foreground">
                  Para aprendices ambiciosos
                </p>

                <div className="my-4 flex items-baseline gap-1">
                  <h1 className="text-3xl font-bold">$15</h1>
                  <p className="text-sm text-muted-foreground">por mes</p>
                </div>

                <Button className="my-2 rounded-full w-full" size="lg" asChild>
                  <Link
                    href={"https://wa.me/04120196456?text='hola,estoyinteraso'"}
                    target="_blank"
                  >
                    Actualizar a pro
                  </Link>
                </Button>

                <div className="my-4 text-sm space-y-2">
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    15 horas de uso por mes
                  </li>
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <LucideCardSim className="size-4" />
                    Memoria de por vida
                  </li>
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <Brain className="size-4" />
                    Razonamiento avanzado
                  </li>
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <SparklesIcon className="size-4" />
                    Acceso a personajes PRO
                  </li>
                  <li className="list-none flex items-center gap-2 text-muted-foreground">
                    <Mic className="size-4" />
                    Clonación de voz
                  </li>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </motion.section>
  );
}

const Description = ({ children }: { children: string }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="my-2 prose prose-neutral prose-sm md:prose-sm max-w-4xl dark:prose-invert leading-relaxed">
      <Markdown>{isCollapsed ? children.slice(0, 360) : children}</Markdown>
      {isCollapsed && (
        <span
          className="text-sm text-nowrap text-accent cursor-pointer hover:underline"
          onClick={() => setIsCollapsed(false)}
        >
          Mostrar mas
        </span>
      )}
    </div>
  );
};
