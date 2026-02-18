"use client";

import { ProfileMedia } from "@/components/profile/profile-media";
import * as Sentry from "@sentry/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfiles } from "@/hooks/use-get-profiles";
import { useSetProfile } from "@/hooks/use-set-profile";
import { authClient } from "@/lib/auth/auth-client";
import { CrownIcon, PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sileo } from "sileo";
import { PinDialog } from "@/components/pin-dialog";
import { Id } from "@daimo/backend";
import { ParentalLink } from "@/components/parental-link";

export const ProfileSelectView = () => {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center gap-16 md:gap-12 px-4">
      <motion.h1
        className="text-4xl font-medium tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "backOut", type: "spring", damping: 20 }}
      >
        ¿Quién va a usar Daimo?
      </motion.h1>
      <AnimatePresence mode="wait">
        <Profiles />
      </AnimatePresence>
    </main>
  );
};

const Profiles = () => {
  const { data: profiles, isPending } = useGetProfiles();
  const { refetch } = authClient.useSession();
  const setProfile = useSetProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (isPending) {
    return <SkeletonProfiles />;
  }

  return (
    <motion.ul
      initial={{ opacity: 0 }}
      key="ul"
      transition={{ ease: "backOut", type: "spring", damping: 20 }}
      animate={{ opacity: 1 }}
      className="flex items-center md:flex-row flex-wrap gap-6 md:gap-3 justify-center"
    >
      {profiles?.map((profile) => (
        <li
          key={profile._id}
          onClick={async () => {
            if (profile.isOwner) {
              setIsOpen(true);

              return;
            }

            setIsLoading(true);

            try {
              await setProfile({ profileId: profile._id });
              await refetch();

              router.push("/home");
            } catch (e) {
              Sentry.captureException(e);

              sileo.error({
                title:
                  "Hubo un error intentando cambiar de perfil, intenta de nuevo más tarde",
              });
            } finally {
              setIsLoading(false);
            }
          }}
          className="flex gap-3 flex-col items-center hover:bg-secondary/20 transition-colors px-6 py-3 rounded-md cursor-pointer"
        >
          <ProfileMedia
            fallback={profile.name}
            size="xl"
            src={profile.media}
            profileId={profile._id}
          />
          <span className="text-lg flex items-center gap-1">
            {profile.name}
            {profile.isOwner && (
              <>
                <CrownIcon className="size-4 text-chart-3" />
                <PinDialog
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  onSuccess={async () => {
                    setIsOpen(false);

                    setIsLoading(true);

                    const sessionId = sessionStorage.getItem("parentalToken");

                    try {
                      await setProfile({
                        profileId: profile._id,
                        parentalToken: sessionId as Id<"parentalToken">,
                      });

                      router.push("/home");
                    } catch (e) {
                      Sentry.captureException(e);

                      sileo.error({
                        title:
                          "Hubo un error intentando cambiar de perfil, intenta de nuevo más tarde",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                />
              </>
            )}
          </span>
        </li>
      ))}

      <ParentalLink href="/parental/profile/create">
        <li className="flex gap-3 flex-col items-center hover:bg-secondary/20 transition-colors px-6 py-3 rounded-md cursor-pointer">
          <div className="size-28 rounded-full bg-secondary grid place-content-center text-muted-foreground">
            <PlusIcon className="size-18" strokeWidth={0.5} />
          </div>
          <span className="text-lg">Crear perfil</span>
        </li>
      </ParentalLink>
    </motion.ul>
  );
};

const SkeletonProfiles = () => {
  return (
    <motion.ul
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      key="skeleton"
      transition={{ delay: 0.1, ease: "backOut", type: "spring", damping: 20 }}
      className="flex items-center gap-12"
    >
      {Array.from({ length: 5 })?.map((_, index) => (
        <li key={index} className="flex flex-col gap-3 items-center">
          <Skeleton className="size-28 rounded-full" />

          <Skeleton className="w-14 h-4 rounded-xs" />
        </li>
      ))}
    </motion.ul>
  );
};
