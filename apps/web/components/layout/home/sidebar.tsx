"use client";

import { motion } from "motion/react";
import { internal } from "@daimo/backend";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Session } from "@/lib/types";
import {
  ArrowUp,
  Compass,
  Monitor,
  MoonIcon,
  PaletteIcon,
  PlusIcon,
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
import { Button } from "@/components/ui/button";
import { Field, FieldDescription } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useAction, useMutation } from "convex/react";

export default function HomeSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar>
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
          <SidebarGroupContent className="flex flex-col gap-2">
            <CreateCharacter />
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton isActive={pathname === "/home"}>
                <Compass />
                Inicio
              </SidebarMenuButton>
            </SidebarMenuItem>
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

function CreateCharacter() {
  const mutation = useAction(internal);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="items-center justify-start"
          size="sm"
          variant="ghost"
        >
          <PlusIcon />
          Crear personaje
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl w-full py-8 gap-6">
        <motion.header
          className="w-fit mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <DialogTitle className="mx-auto font-normal text-3xl my-auto">
            Crea tu personaje
          </DialogTitle>
        </motion.header>

        <motion.div
          className="my-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Field>
            <InputGroup className="md:text-base rounded-2xl resize-none h-24 focus-visible:outline-0 focus-visible:ring-0">
              <InputGroupTextarea
                placeholder="Describe o referencia al personaje que quisieras crear"
                className="md:text-base h-24 focus-visible:outline-0 ring-0 focus-visible:ring-0  bg-secondary "
              />
              <InputGroupAddon align="block-end">
                <InputGroupButton
                  variant="default"
                  className="rounded-full ml-auto"
                  size="icon-sm"
                >
                  <ArrowUp />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
