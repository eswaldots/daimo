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
import { HomeIcon, User, SettingsIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { NavUser } from "@/components/layout/home/nav-user";

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

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="pt-4 px-4 bg-background">
        <SidebarMenu>
          <SidebarMenuButton className="hover:bg-transparent active:bg-transparent">
            <Link href="/home">
              <h1 className="font-medium tracking-tight text-2xl text-foreground">
                daimo{" "}
                <span className="text-muted-foreground font-normal">
                  for parents
                </span>
              </h1>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup className="px-4">
          <SidebarGroupContent className="flex flex-col gap-1">
            {/*<CreateCharacter />*/}
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={pathname === "/home"}
                className="gap-6 rounded-lg text-sm tracking-wide font-medium py-5 [&>svg]:size-5 data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-primary"
                asChild
              >
                <Link href="/home">
                  {pathname === "/home" ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.3861 1.21065C11.7472 0.929784 12.2528 0.929784 12.6139 1.21065L21.6139 8.21065C21.8575 8.4001 22 8.69141 22 9V20C22 20.7957 21.6839 21.5587 21.1213 22.1213C20.5587 22.6839 19.7957 23 19 23H16C15.4477 23 15 22.5523 15 22V14C15 13.4477 14.5523 13 14 13H10C9.44772 13 9 13.4477 9 14V22C9 22.5523 8.55228 23 8 23H5C4.20435 23 3.44129 22.6839 2.87868 22.1213C2.31607 21.5587 2 20.7957 2 20V9C2 8.69141 2.14247 8.4001 2.38606 8.21065L11.3861 1.21065Z"
                        fill="var(--primary)"
                      />
                    </svg>
                  ) : (
                    <HomeIcon />
                  )}
                  <span>Inicio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={
                  pathname === "/characters" ||
                  pathname.startsWith("/characters/")
                }
                className="gap-6 rounded-lg text-sm tracking-wide font-medium py-5 [&>svg]:size-5 data-[active=true]:font-semibold data-[active=true]:[&>svg]:fill-primary"
                asChild
              >
                <Link href="/characters">
                  <User strokeWidth={2} />
                  <span>Personajes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4 px-4 bg-background ">
        <SidebarGroupContent>
          <SidebarMenuButton
            className="gap-6 rounded-lg text-sm tracking-wide font-medium py-5 [&>svg]:size-5 data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-primary"
            asChild
          >
            <Link href="/settings">
              <SettingsIcon />
              Configuración
            </Link>
          </SidebarMenuButton>
        </SidebarGroupContent>

        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
