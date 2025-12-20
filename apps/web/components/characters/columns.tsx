"use client";

import { api, Doc } from "@daimo/backend";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const charactersColumns: ColumnDef<
  Doc<"characters"> & { storageUrl?: string | null }
>[] = [
  {
    accessorKey: "storageUrl",
    header: "Imagen",
    cell: ({ row }) => {
      const character = row.original;

      return (
        <Avatar>
          <AvatarFallback>{character.name}</AvatarFallback>
          <AvatarImage
            src={character.storageUrl ?? ""}
            className="object-cover object-[50%_25%]"
          />
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "shortDescription",
    header: "Descripción",
  },
  {
    accessorKey: "_creationTime",
    header: "Fecha de creación",
    cell: ({ row }) => {
      const character = row.original;

      return <div>{new Date(character._creationTime).toLocaleString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      const deleteCharacter = useMutation(api.characters.deleteCharacter);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment._id)}
            >
              Copiar modelo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/characters/${payment._id}/edit`}>
                Editar personaje
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteCharacter({ characterId: payment._id });

                  toast.success("Personaje eliminado exitosamente");
                } catch {
                  toast.error("Hubo un error intentando guardar el personaje");
                }
              }}
            >
              Eliminar personaje
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
