"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useMemo, useState } from "react";
import { PARENTAL_DASHBOARD_ROUTES } from "../../consts";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-profile";
import { ProfileMedia } from "@/components/profile/profile-media";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  Sparkles,
  Settings,
  SunMoonIcon,
  LockIcon,
  LogOut,
  Home,
  Menu,
} from "lucide-react";
import posthog from "posthog-js";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

// TODO: use real breadcrumbs here

export const ParentalHeader = () => {
  const { title } = useBreadcrumbs();

  const { isMobile, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <header className="py-2 md:py-3 px-6 border-b border-border flex items-center md:justify-end justify-between bg-background relative">
      {isMobile && (
        <Button size="icon" variant="ghost" onClick={() => toggleSidebar()}>
          <Menu className="size-5.5" />
        </Button>
      )}

      <h1 className="font-medium absolute left-1/2 -translate-x-1/2 md:left-15  tracking-tight">
        {title}
      </h1>

      <NavUser />
    </header>
  );
};

const NavUser = () => {
  const { data, isPending, isError } = useProfile();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (isPending) {
    return <Skeleton className="rounded-full size-9 m-0.5" />;
  }

  if (isError) {
    return <h1 className="text-destructive font-mono">error</h1>;
  }

  const profile = data;

  return (
    data && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="cursor-pointer p-0.5 h-fit w-fit">
            <ProfileMedia
              fallback={data.name}
              className="size-9"
              size="default"
              profileId={data._id}
              src={data.media}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          side={"bottom"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <ProfileMedia
                profileId={data._id}
                fallback={data.name}
                src={data.media}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile?.name}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* TODO: Add upgrade to pro dialog*/}
            <DropdownMenuItem
              onSelect={() => {
                posthog.capture("upgrade_to_pro_clicked", {
                  source: "nav_user_menu",
                });
              }}
            >
              <Sparkles className="text-foreground" />
              Actualizar a pro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="text-foreground" />
                Ajustes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="dark:hover:bg-secondary hover:bg-secondary">
                <SunMoonIcon className="text-foreground" />
                Aspecto
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={theme === "dark"}
                  onCheckedChange={() => {
                    setTheme("dark");
                  }}
                >
                  Oscuro
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={theme === "light"}
                  onCheckedChange={() => {
                    setTheme("light");
                  }}
                >
                  Claro
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={theme === "system"}
                  onCheckedChange={() => {
                    setTheme("system");
                  }}
                >
                  Sistema
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/home">
              <Home className="text-foreground" />
              Inicio
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                setIsLoading(true);

                const { error } = await authClient.signOut();

                if (error) {
                  setIsLoading(false);

                  return;
                }

                // Capture logout event and reset PostHog
                posthog.capture("user_signed_out");
                posthog.reset();

                setIsLoading(false);

                router.push("/");
              } catch {
                // common error doesn't log to sentry
                router.push("/");
              }
            }}
          >
            {isLoading ? (
              <Spinner className="text-foreground" />
            ) : (
              <LogOut className="text-foreground" />
            )}
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};

const useBreadcrumbs = () => {
  const pathname = usePathname();
  const { profileId } = useParams();

  const title = useMemo(() => {
    return PARENTAL_DASHBOARD_ROUTES.find(
      (route) =>
        route.path.replace(":profileId", profileId as string) === pathname,
    )?.title;
  }, [pathname, profileId]);

  return { title };
};
