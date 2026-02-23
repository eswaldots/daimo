"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SheetIcon, ChevronDown } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useGetProfiles } from "@/hooks/use-get-profiles";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileMedia } from "@/components/profile/profile-media";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Render the application's left sidebar with header, primary navigation, and current-user footer.
 *
 * The sidebar includes a title linking to /home, navigation entries for "Inicio" and "Personajes" whose active
 * state is derived from the current pathname, and a footer showing the current user's avatar, name, and email.
 *
 * @param session - The user's session object; used to populate the footer's avatar, name, and email.
 * @returns The sidebar JSX element containing header, navigation content, and footer user display.
 */
export default function ParentalSidebar() {
  const pathname = usePathname();
  const { profileId } = useParams();

  return (
    <Sidebar className="border-border">
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarMenuItem>
              <ProfileSelector />
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup className="px-4">
          <SidebarGroupContent className="flex flex-col gap-1">
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={pathname === `/parental/dashboard/${profileId}`}
                className="data-[active=true]:text-foreground data-[active=false]:text-muted-foreground"
                asChild
              >
                <Link href={`/parental/dashboard/${profileId}`}>
                  <SheetIcon />
                  <span>Resumen</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}

const ProfileSelector = () => {
  const { profileId } = useParams();
  const { data: profiles, isPending } = useGetProfiles();
  const router = useRouter();

  const actualProfile = useMemo(() => {
    if (!profiles) return null;
    return profiles.find((profile) => profile._id === profileId)!!;
  }, [profiles, profileId]);

  if (isPending) {
    return (
      <SidebarMenuButton className="text-base gap-2 h-fit">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-12" />
        <ChevronDown className="text-muted-foreground ml-auto" />
      </SidebarMenuButton>
    );
  }

  return (
    actualProfile && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="text-base gap-2 h-fit">
            <ProfileMedia
              fallback={actualProfile.name}
              size="default"
              profileId={actualProfile._id}
              src={actualProfile.media}
            />
            {actualProfile.name}
            <ChevronDown className="text-muted-foreground ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          {profiles
            ?.filter((profile) => profile._id !== profileId)
            .map((profile) => (
              <DropdownMenuItem
                key={profile._id}
                className="cursor-pointer"
                onSelect={() => {
                  router.push(`/parental/dashboard/${profile._id}`);
                }}
              >
                <ProfileMedia
                  fallback={profile.name}
                  size="default"
                  profileId={profile._id}
                  src={profile.media}
                />
                <h1 className="text-base mx-1 font-medium">{profile.name}</h1>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};
