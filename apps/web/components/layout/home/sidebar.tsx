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
  Monitor,
  MoonIcon,
  PaletteIcon,
  Settings,
  SunIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export default function HomeSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar className="border-input">
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuButton className="hover:bg-transparent">
            <Link href="/home">
              <h1 className="font-medium tracking-tight text-2xl">daimo</h1>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-1">
            {/*<CreateCharacter />*/}
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton isActive={pathname === "/home"} asChild>
                <Link href="/home">
                  <Compass className="text-muted-foreground" />
                  Inicio
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/*<SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton isActive={pathname === "/characters"} asChild>
                <Link href="/characters">
                  <User2Icon />
                  Tus personajes
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>*/}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <SidebarMenuItem className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <Settings />
                Configuración
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" className="md:max-w-full w-full">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <PaletteIcon />
                  Tema
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        <NavUser
          user={{
            avatar: session.user.image ?? "",
            email: session.user.email,
            name: session.user.name,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
