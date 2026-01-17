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
import { motion } from "motion/react";
import { Doc } from "../../../../packages/backend/convex/_generated/dataModel";
import Image from "next/image";
import { AudioLines, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

/**
 * Render a loading skeleton that visually stands in for a character card.
 *
 * @returns A JSX element representing the placeholder skeleton for a character card while content loads.
 */
export function CharacterCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="md:w-74 w-full"
    >
      <Card className="bg-transparent h-86 border-0 shadow-none w-full md:w-74 rounded-2xl px-0 gap-2 py-4">
        <CardHeader className="px-0">
          <Skeleton className="w-full h-64 rounded-lg bg-secondary dark:bg-border" />
        </CardHeader>

        <CardContent className="space-y-2 px-0">
          <Skeleton className="h-5 w-1/2 bg-secondary dark:bg-border" />
          <Skeleton className="h-3 w-full bg-secondary dark:bg-border" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Render a responsive character card that links to the character details page.
 *
 * The card displays the character image (using `storageUrl` when present), name, short description,
 * and a "PRO" badge when `accessType` is `"premium"`. On non-mobile layouts an inline play button
 * overlays the image and navigates to the playground for the character.
 *
 * @param props - Character document augmented with an optional `storageUrl` for the image.
 *   Expected fields include `_id`, `name`, `shortDescription`, `creatorId`, and `accessType`.
 * @returns A JSX element for a responsive character card that navigates to `/characters/{_id}` when clicked.
 */
export function CharacterCard(
  props: Doc<"characters"> & { storageUrl?: string | null },
) {
  const isMobile = useIsMobile();
  const { data } = authClient.useSession();
  const isPremium = props.accessType === "premium";

  const router = useRouter();

  if (!isMobile) {
    return (
      <Link href={`/characters/${props._id}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring" }}
        >
          <Card className="group px-0 bg-transparent duration-300 cursor-pointer transition-colors border-0 shadow-none w-full md:w-74 rounded-2xl py-4 gap-2">
            <CardHeader className="px-0 rounded-lg relative">
              <motion.picture>
                {props.storageUrl ? (
                  <Image
                    src={props.storageUrl}
                    alt="image"
                    width={1028}
                    height={1028}
                    className="rounded-lg h-64 object-cover object-[50%_25%] dark:bg-border/80 bg-secondary"
                  />
                ) : (
                  <h1 className="text-foreground text-4xl font-semibold">?</h1>
                )}
              </motion.picture>
              <div className="group-hover:opacity-100 opacity-0 transition-all h-64 rounded-lg bg-black/20 absolute inset-0">
                <Button
                  className="backdrop-blur-xl bg-black/50 absolute left-2 bottom-2 text-white rounded-full hover:bg-white hover:text-black cursor-pointer duration-75"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    router.push(`/playground/${props._id}/`);
                  }}
                >
                  <AudioLines />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 truncate px-0">
              <CardTitle>
                <div className="flex items-center w-full gap-2 hover:underline min-h-6">
                  {props.name}{" "}
                  {isPremium && (
                    <div className="font-mono font-medium text-xs text-primary tracking-wide flex items-center flex-row gap-1 bg-secondary px-2 py-1 rounded-full">
                      <SparklesIcon className="size-3" />
                      PRO
                    </div>
                  )}
                </div>
              </CardTitle>
              <CardDescription className="text-balance max-h-16">
                {props.shortDescription}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/characters/${props._id}`} className="w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring" }}
        className="w-full"
      >
        <Card className="group px-0 bg-transparent duration-300 cursor-pointer transition-colors border-0 shadow-none w-full rounded-2xl py-4 gap-2">
          <CardHeader className="px-0 rounded-lg relative">
            <motion.picture>
              {props.storageUrl ? (
                <Image
                  src={props.storageUrl}
                  alt="image"
                  width={1028}
                  height={1028}
                  className="rounded-xl h-96 object-cover object-[50%_25%] bg-secondary"
                />
              ) : (
                <h1 className="text-foreground text-4xl font-semibold">?</h1>
              )}
            </motion.picture>
          </CardHeader>

          <CardContent className="md:space-y-2 truncate px-0">
            <CardTitle>
              <div className="flex items-center w-full justify-between hover:underline md:text-base text-lg min-h-6">
                {props.name}
                {isPremium && (
                  <div className="font-mono font-medium text-xs text-background tracking-wide flex items-center flex-row gap-1 bg-primary px-2 py-1 rounded-full">
                    <SparklesIcon className="size-3" />
                    PRO
                  </div>
                )}
              </div>
            </CardTitle>
            <CardDescription className="text-balance max-h-16 text-sm">
              {props.shortDescription}
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
