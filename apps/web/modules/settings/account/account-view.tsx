"use client";

import { useProfile } from "@/hooks/use-profile";
import * as Sentry from "@sentry/nextjs";
import { parseToLocaleString } from "@/lib/date";
import { ProfileMedia } from "@/components/profile/profile-media";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { useGetProfiles } from "@/hooks/use-get-profiles";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { CrownIcon, MinusIcon, PlusIcon, UserIcon } from "lucide-react";
import { ParentalLink } from "@/components/parental-link";
import { useSetProfile } from "@/hooks/use-set-profile";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PinDialog } from "@/components/pin-dialog";
import { api, Id } from "@daimo/backend";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useHasPin } from "@/hooks/use-has-pin";
import { sileo } from "sileo";
import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";

export const AccountView = () => {
  return (
    <main className="space-y-10">
      <Profile />
      <Separator />
      <ProfileSelect />
    </main>
  );
};

const Profile = () => {
  const { data, isPending } = useProfile();

  if (isPending) {
    return <SkeletonProfile />;
  }

  return (
    <motion.div
      className="flex flex-col items-start gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ProfileMedia
        src={data?.media ?? ""}
        fallback={data?.name ?? ""}
        profileId={data?._id ?? ""}
        size="xl"
      />
      <div className="flex flex-col items-start gap-0.5">
        <h1 className="text-3xl tracking-tight font-semibold">
          {data?.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Creado el {parseToLocaleString(data?._creationTime ?? 0)}
        </p>
      </div>
    </motion.div>
  );
};

const SkeletonProfile = () => {
  return (
    <div className="flex flex-col items-start gap-6">
      <Skeleton className="size-28 rounded-full" />
      <div className="flex flex-col items-start gap-0.5">
        <Skeleton className="h-7 w-24 my-1" />
        <Skeleton className="h-5 w-64" />
      </div>
    </div>
  );
};

const ProfileSelectSkeleton = () => {
  return (
    <section className="grid gap-8">
      <h1 className="tracking-tight font-semibold text-xl">
        Cambiar de perfil
      </h1>
      <div
        className={cn(
          "flex items-center transition-opacity -ml-3 gap-2 md:overflow-x-none overflow-x-auto max-w-full",
        )}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 cursor-pointer px-6 py-3 hover:bg-secondary/50 transition-colors rounded-md"
          >
            <Skeleton className="size-24 rounded-full" />

            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
        ))}

        <ParentalLink href="/parental/profile/create">
          <div className="flex flex-col items-center gap-3 cursor-pointer px-6 py-3 hover:bg-secondary/50 transition-colors rounded-md">
            <Button
              className="rounded-full size-24 cursor-pointer"
              variant="secondary"
            >
              <PlusIcon
                className="size-10 text-muted-foreground"
                strokeWidth={1.5}
              />
            </Button>
            Nuevo perfil
          </div>
        </ParentalLink>
      </div>
    </section>
  );
};

const ProfileSelect = () => {
  const { data: userData, refetch } = authClient.useSession();
  const { data, isPending } = useGetProfiles();
  const [isEditing, setIsEditing] = useState(false);
  const setProfile = useSetProfile();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [dialogProfileId, setDialogProfileId] = useState<Id<"profile"> | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: hasPin } = useHasPin();

  const { data: lastActiveProfileId, isPending: isPendingProfile } =
    useQueryWithStatus(api.parental.usage.getLastActiveProfileId);

  if (isPending || isPendingProfile) {
    return <ProfileSelectSkeleton />;
  }

  return (
    data &&
    userData && (
      <section className="grid gap-8">
        <h1 className="tracking-tight font-semibold text-xl">
          Cambiar de perfil
        </h1>
        <div
          className={cn(
            "flex items-center transition-opacity -ml-3 gap-2 md:overflow-x-none overflow-x-auto max-w-full",
            isLoading && "opacity-80 cursor-disabled pointer-events-none",
          )}
        >
          {data.filter(
            (profile) => profile._id != userData.session.activeProfileId,
          ).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserIcon />
                  </EmptyMedia>
                  <EmptyTitle>No tienes perfiles todavía</EmptyTitle>
                  <EmptyDescription className="md:max-w-xs">
                    Daimo es para niños, crea un perfil para un niño y así
                    empezar a divertirse
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                  <ParentalLink href="/parental/profile/create">
                    <Button>Crear perfil</Button>
                  </ParentalLink>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : (
            data
              .filter(
                (profile) => profile._id != userData.session.activeProfileId,
              )
              .map((profile) => (
                <Fragment key={profile._id}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={async () => {
                      if (profile.isOwner && hasPin) {
                        setIsDialogOpen(true);

                        setDialogProfileId(profile._id);

                        return;
                      }

                      setIsLoading(true);

                      try {
                        await setProfile({ profileId: profile._id });
                        if (profile.isOwner && !hasPin) {
                          sileo.warning({
                            title: "Estas entrando al perfil de administrador",
                            description:
                              "Se sugiere crear un PIN parental para evitar operaciones peligrosas malentendidas",
                            fill: "#171717",
                          });
                        }
                        await refetch();

                        router.push("/home");
                      } catch (e) {
                        Sentry.captureException(e);

                        sileo.error({
                          title: "Hubo un error",
                          description:
                            "Hubo un error intentando cambiar de perfil, intenta de nuevo más tarde",
                          fill: "#171717",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center gap-3 cursor-pointer px-6 py-3 hover:bg-secondary/50 transition-colors rounded-md",
                      isEditing && "hover:bg-destructive/10",
                    )}
                  >
                    <div className="relative">
                      <ProfileMedia
                        src={profile?.media ?? ""}
                        fallback={profile?.name ?? ""}
                        profileId={profile._id ?? ""}
                        className={cn("transition-colors")}
                        size="lg"
                      />
                      {isEditing && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="-top-0 -right-0 absolute p-1 rounded-full bg-destructive size-6"
                          >
                            <MinusIcon className="fill-destructive/10 text-white absolute size-4" />
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                    <h1 className="flex items-center gap-2">
                      {profile.name}{" "}
                      {profile.isOwner && (
                        <>
                          <CrownIcon className="size-4 text-chart-3" />
                        </>
                      )}
                    </h1>
                  </motion.div>

                  {profile.isOwner && (
                    <PinDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                      onSuccess={async () => {
                        setIsDialogOpen(false);
                        setDialogProfileId(null);
                        setIsLoading(true);

                        // will always true
                        const sessionId =
                          sessionStorage.getItem("parentalToken");

                        if (!sessionId) {
                          sileo.error({
                            title: "No se encontro el token",
                            fill: "#171717",
                            description:
                              "No pudimos encontrar su token de seguridad parental, esto es un error poco común, contacté con soporte inmediatamente",
                          });

                          return;
                        }

                        try {
                          await setProfile({
                            profileId: profile._id,
                            parentalToken: sessionId as Id<"parentalToken">,
                          });
                          await refetch();

                          // TODO: when building parental dashboard redirect to parental dashboard
                          // also TODO: check if lastActiveProfileId is null
                          // also also TODO: doesn't redirect to profile is profile isOwner
                          if (lastActiveProfileId) {
                            router.push(
                              `/parental/dashboard/${lastActiveProfileId}/`,
                            );
                          } else {
                            router.push("/home");
                          }
                        } catch (e) {
                          Sentry.captureException(e);

                          toast.error(
                            "Hubo un error intentando cambiar de perfil, intenta de nuevo más tarde",
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    />
                  )}
                </Fragment>
              ))
          )}

          {data.length > 1 && (
            <ParentalLink href="/parental/profile/create">
              <div className="flex flex-col items-center gap-3 cursor-pointer px-6 py-3 hover:bg-secondary/50 transition-colors rounded-md">
                <Button
                  className="rounded-full size-24 cursor-pointer"
                  variant="secondary"
                >
                  <PlusIcon
                    className="size-10 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </Button>
                Nuevo perfil
              </div>
            </ParentalLink>
          )}
        </div>
      </section>
    )
  );
};
