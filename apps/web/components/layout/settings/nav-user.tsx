"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  const { data: subscription, isPending } = useQueryWithStatus(
    api.subscriptions.getCurrentSubscription,
  );
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-foreground">
                  {user.name}
                </span>
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
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
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
              {/* TODO: Add a Dialog to include settings*/}
              <DropdownMenuItem>
                <Settings className="text-foreground" />
                Ajustes
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLoading(true);

                const { error } = await authClient.signOut();

                if (error) {
                  setIsLoading(false);

                  return;
                }

                // Capture logout event and reset PostHog
                posthog.capture("user_signed_out");
                posthog.reset();

                router.push("/");
                setIsLoading(false);
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

