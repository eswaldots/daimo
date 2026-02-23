"use client";

import {
  LockIcon,
  LogOut,
  Settings,
  Sparkles,
  SunMoonIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { api } from "@daimo/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { motion } from "motion/react";
import { ProfileMedia } from "@/components/profile/profile-media";
import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ParentalLink } from "@/components/parental-link";

/**
 * Renders a sidebar user button with an avatar and a centered dropdown menu of account actions.
 *
 * The menu shows the user's name, email, and current plan status, and exposes actions for upgrading,
 * opening settings, and signing out. Selecting "Cerrar sesión" signs the user out, records an analytics
 * event, and navigates to the root path.
 *
 * @param user - The user profile to display (`name`, `email`, `avatar`).
 * @returns The sidebar user menu React element.
 */
export function NavUser() {
  const { data: profile, isPending: isPendingProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const { data: subscription, isPending } = useQueryWithStatus(
    api.subscriptions.getCurrentSubscription,
  );
  const router = useRouter();
  const { data: lastActiveProfileId, isPending: isPendingLastProfile } =
    useQueryWithStatus(api.parental.usage.getLastActiveProfileId);
  const { theme, setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isPendingProfile ? (
                <Skeleton className="rounded-full size-8" />
              ) : (
                profile && (
                  <ProfileMedia
                    src={profile.media}
                    profileId={profile._id}
                    fallback={profile.name}
                  />
                )
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isPendingProfile ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <span className="truncate font-medium text-foreground">
                    {profile?.name}
                  </span>
                )}
                <span className="truncate text-xs text-foreground font-normal">
                  {!isPending ? (
                    !subscription ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Gratuito
                      </motion.span>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Pro
                      </motion.span>
                    )
                  ) : (
                    <Skeleton className="w-34 h-4" />
                  )}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={"bottom"}
            align="center"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {isPendingProfile ? (
                  <Skeleton className="rounded-full size-9" />
                ) : (
                  profile && (
                    <ProfileMedia
                      profileId={profile._id}
                      fallback={profile.name}
                    />
                  )
                )}
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
            {profile?.isOwner &&
              !isPendingLastProfile &&
              lastActiveProfileId && (
                <>
                  <ParentalLink
                    href={`/parental/dashboard/${lastActiveProfileId}`}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <LockIcon className="text-foreground" />
                      Modo padre
                    </DropdownMenuItem>
                  </ParentalLink>

                  <DropdownMenuSeparator />
                </>
              )}

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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
