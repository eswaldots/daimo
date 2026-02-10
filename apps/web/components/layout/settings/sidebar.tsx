"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Session } from "@/lib/types";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Render the application's left sidebar with header, primary navigation, and current-user footer.
 *
 * The sidebar includes a title linking to /home, navigation entries for "Inicio" and "Personajes" whose active
 * state is derived from the current pathname, and a footer showing the current user's avatar, name, and email.
 *
 * @param session - The user's session object; used to populate the footer's avatar, name, and email.
 * @returns The sidebar JSX element containing header, navigation content, and footer user display.
 */
export default function SettingsSidebar({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="pt-4 px-4 bg-background">
        <SidebarMenu>
          <SidebarMenuButton className="hover:bg-transparent active:bg-transparent">
            <Link href="/home">
              <h1 className="font-medium tracking-tight text-2xl text-foreground">
                daimo
              </h1>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup className="px-4">
          <SidebarGroupLabel className="my-4 text-lg">
            Configuración
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-1">
            {/*<CreateCharacter />*/}
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={pathname === "/settings"}
                className="gap-6 rounded-lg text-sm px-4 tracking-wide font-medium py-5 [&>svg]:size-5 data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-primary"
                asChild
              >
                <Link href="/home">
                  <span>Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4 px-4 bg-background ">
        {/*
<NavUser
          user={{
            avatar: session.user.image ?? "",
            email: session.user.email,
            name: session.user.name,
          }}
        />
	      */}
      </SidebarFooter>
    </Sidebar>
  );
}
