import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Doc } from "@daimo/backend";
import Link from "next/link";

const ConversationItem = (
  conversation: Doc<"conversations"> & {
    isActive?: boolean;
    character?: Doc<"characters"> & { image: string | null };
  },
) => {
  return (
    <SidebarMenuItem>
      <Link
        href={`/admin/users/${conversation.userId}/conversations/${conversation._id}`}
        className={cn(
          "flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-md cursor-pointer transition-colors",
          conversation.isActive && "bg-foreground/10 hover:bg-foreground/20",
        )}
      >
        <Avatar className="size-9">
          <AvatarImage
            src={conversation.character?.image ?? ""}
            className="size-10"
          />
        </Avatar>
        <div>
          <div className="flex items-center  gap-2">
            <h1 className="font-medium">
              {conversation.character?.name ?? "Nueva conversación"}
            </h1>

            {conversation.isLive && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-chart-2 p-1 rounded-full animate-pulse" />
                </TooltipTrigger>
                <TooltipContent>
                  Esta conversación esta ocurriendo en este momento
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {conversation.title ?? "Sin titulo"} ·{" "}
            {new Date(conversation._creationTime).toLocaleDateString()}
          </p>
        </div>
      </Link>
    </SidebarMenuItem>
  );
};

export { ConversationItem };
