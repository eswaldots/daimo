"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { api } from "@daimo/backend";
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
  User2Icon,
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
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useAction } from "convex/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

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

function CreateCharacter() {
  const createCharacter = useAction(api.charactersActions.create);
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await createCharacter({ description });
      setDescription("");
      toast.success("El personaje ha sido creado correctamente");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create character:", error);
      toast.error(
        "Hubo un error intentando crear el personaje, intente de nuevo más tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="items-center justify-start bg-background border border-border"
          size="sm"
          variant="ghost"
        >
          <PlusIcon />
          Nuevo personaje
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
            <InputGroup className="md:text-base rounded-2xl resize-none h-24 focus-visible:outline-0 focus-visible:ring-0  border-border">
              <InputGroupTextarea
                placeholder="Describe al personaje que quisieras crear"
                className="md:text-base h-24 focus-visible:outline-0 ring-0 focus-visible:ring-0  bg-secondary "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
              />
              <InputGroupAddon align="block-end">
                <InputGroupButton
                  variant="default"
                  className="rounded-full ml-auto"
                  size="icon-sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                >
                  {isSubmitting ? <Spinner /> : <ArrowUp />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
