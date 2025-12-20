"use client";

import { NavUser } from "../home/nav-user";
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
import { Session } from "@/lib/types";
import {
  AudioLines,
  Monitor,
  MoonIcon,
  PaletteIcon,
  Settings,
  SunIcon,
  ToyBrickIcon,
  Users2Icon,
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

export default function AdminSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar className="border-input" variant="inset">
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuButton className="hover:bg-transparent">
            <Link href="/home">
              <h1 className="font-medium tracking-tight text-2xl text-foreground">
                daimo{" "}
                <span className="text-muted-foreground font-normal">
                  for admins
                </span>
              </h1>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-1">
            {/*<CreateCharacter />*/}
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton isActive={pathname === "/admin/users"} asChild>
                <Link href="/admin/users">
                  <Users2Icon />
                  Usuarios
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={pathname === "/admin/characters"}
                asChild
              >
                <Link href="/admin/characters">
                  <ToyBrickIcon />
                  Personajes
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                isActive={pathname === "/admin/voices"}
                asChild
              >
                <Link href="/admin/voices">
                  <AudioLines />
                  Voces
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
