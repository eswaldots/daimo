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
import { NavUser } from "./nav-user";
import { Session } from "@/lib/types";
import {
  Compass,
  Ellipsis,
  Home,
  Monitor,
  MoonIcon,
  PaletteIcon,
  Settings,
  SunIcon,
  User,
  User2Icon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuSubTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

/**
 * Renders the application's left sidebar with header, primary navigation, and settings/logout controls.
 *
 * The sidebar includes a clickable title linking to "/home", a navigation item for "Inicio" that is active when the pathname is "/home",
 * and a settings menu that allows selecting the UI theme (light, dark, system) and signing out.
 *
 * @param session - The user's session object used to derive user-specific UI (e.g., avatar, email, name) where applicable.
 * @returns The sidebar JSX element containing header, navigation content, and footer controls.
 */
export default function HomeSidebar({ session }: { session: Session }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar className="border-border">
      <SidebarHeader className="pt-4 px-4">
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
      <SidebarContent>
        <SidebarGroup className="px-4">
          <SidebarGroupContent className="flex flex-col gap-1">
            {/*<CreateCharacter />*/}
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={pathname === "/home"}
                className="rounded-lg text-sm"
                asChild
              >
                <Link href="/home">
                  <Home className="size-5" strokeWidth={1.5} />
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
                className="rounded-lg text-sm"
                asChild
              >
                <Link href="/characters">
                  <User className="size-5" strokeWidth={1.5} />
                  <span>Personajes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4 px-4">
        <SidebarMenuItem className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="rounded-full text-sm px-4 font-medium items-center text-muted-foreground">
                <Settings
                  className="size-5 text-muted-foreground"
                  strokeWidth={1.5}
                />
                Configuración
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" className="w-70" align="start">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="w-full">
                  Tema de la interfaz
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-64">
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={(value) => setTheme(value)}
                    >
                      <DropdownMenuRadioItem value="light">
                        <SunIcon /> Claro
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        <MoonIcon /> Oscuro
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">
                        <Monitor /> Sistema
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <div className="px-2 my-1 flex-1">
                <Separator />
              </div>
              <DropdownMenuItem
                onClick={async () => {
                  await authClient.signOut();

                  router.push("/");
                }}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        {/* <NavUser user={{ */}
        {/*     avatar: session.user.image ?? "", */}
        {/*     email: session.user.email, */}
        {/*     name: session.user.name, */}
        {/*   }} */}
        {/* /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
