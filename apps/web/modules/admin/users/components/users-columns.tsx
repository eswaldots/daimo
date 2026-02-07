import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { api } from "@daimo/backend";
import { FunctionReturnType } from "convex/server";
import { useIsMobile } from "@/hooks/use-mobile";

type UserArray = FunctionReturnType<typeof api.auth.users.getAllUsers>;

type ElementType<T> = T extends (infer U)[] ? U : never;

type UserWithInfo = ElementType<UserArray>;

export const userColums: ColumnDef<UserWithInfo>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const user = row.original;
      const { data: actualUser } = authClient.useSession();

      return (
        <div className="flex items-center gap-4 py-1">
          <Avatar>
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <section>
            <div className="flex items-center gap-2">
              <h1 className="font-medium">{user.name}</h1>
              {actualUser?.user?.id === user._id && (
                <Badge className="bg-chart-2/10 text-chart-2">Yo</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </section>
        </div>
      );
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Fecha de creación",
    cell: ({ row }) => new Date(row.original._creationTime).toDateString(),
  },
  {
    header: "Acciones",
    cell: ({ row }) => {
      const { _id, lastConversation } = row.original;
      const isMobile = useIsMobile();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuItem asChild disabled={!lastConversation}>
              <Link
                href={
                  isMobile
                    ? `/admin/users/${_id}/conversations/`
                    : `/admin/users/${_id}/conversations/${lastConversation?._id}`
                }
              >
                Ver conversaciones
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
