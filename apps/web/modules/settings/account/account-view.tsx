"use client";

import { useProfile } from "@/hooks/use-profile";
import { parseToLocaleString } from "@/lib/date";
import { ProfileMedia } from "@/components/profile/profile-media";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { useGetProfiles } from "@/hooks/use-get-profiles";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { CrownIcon, LockIcon, PlusIcon } from "lucide-react";
import { ParentalLink } from "@/components/parental-link";

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

const ProfileSelect = () => {
  const { data: userData } = authClient.useSession();
  const { data, isPending } = useGetProfiles();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  return (
    data &&
    userData && (
      <section className="grid gap-8">
        <h1 className="tracking-tight font-medium">Cambiar de perfil</h1>
        <div className="flex items-center gap-6">
          {data
            .filter(
              (profile) => profile._id != userData.session.activeProfileId,
            )
            .map((profile) => (
              <div
                key={profile._id}
                className="flex flex-col items-center gap-2"
              >
                <ProfileMedia
                  src={profile?.media ?? ""}
                  fallback={profile?.name ?? ""}
                  profileId={profile._id ?? ""}
                  size="lg"
                />

                <h1 className="flex items-center gap-2">
                  {profile.name}{" "}
                  {profile.isOwner && (
                    <CrownIcon className="size-4 text-chart-3" />
                  )}
                </h1>
              </div>
            ))}

          <ParentalLink href="account">
            <div className="flex flex-col items-center gap-2">
              <Button className="rounded-full size-24" variant="secondary">
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
    )
  );
};
