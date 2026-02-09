"use client";

import { authClient } from "@/lib/auth/auth-client";
import { SettingsTitle } from "../components/settings-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AccountView = () => {
  return (
    <main className="space-y-12">
      <Profile />
    </main>
  );
};

const Profile = () => {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <Avatar className="size-28">
        <AvatarFallback>{data?.user?.name.charAt(0)}</AvatarFallback>
        <AvatarImage src={data?.user?.image ?? ""} />
      </Avatar>
      <div className="flex flex-col items-start gap-0.5">
        <h1 className="text-3xl tracking-tight font-semibold">
          {data?.user?.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">{data?.user.email}</p>
      </div>
    </div>
  );
};

const SkeletonProfile = () => {
  const { data, isPending } = authClient.useSession();

  return <div></div>;
};
