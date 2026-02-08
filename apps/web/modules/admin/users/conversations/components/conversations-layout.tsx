"use client";

import SearchInput from "@/components/layout/search-input";
import { useIsMobile } from "@/hooks/use-mobile";
import { api, Doc } from "@daimo/backend";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { ConversationItem } from "./conversation-item";
import Link from "next/link";

export const ConversationsLayout = (props: {
  preloadedConversations: Preloaded<
    typeof api.agent.conversation.getConversationsByUserId
  >;
  children: ReactNode;
}) => {
  const { conversations, user } = usePreloadedQuery(
    props.preloadedConversations,
  );

  const isMobile = useIsMobile();
  const { conversationId } = useParams();

  return (
    <main className="flex items-center gap-6 absolute left-0 top-12 md:top-0 w-full md:overflow-y-hidden overflow-x-hidden md:max-w-[calc(100vw-var(--sidebar-width))]!">
      {!isMobile && (
        <div className="flex flex-col items-start w-sm ml-1 h-screen border-r border-border py-4 px-4">
          <h1 className="text-lg font-medium tracking-tight">
            Historial de {user?.name.split(" ")[0]}
          </h1>

          <SearchInput
            placeholder="Buscar en el historial"
            className="md:w-full my-4 rounded-md"
          />

          <ul className="h-full overflow-y-scroll w-full grid gap-1">
            {conversations
              .filter((conversation) => !!conversation)
              .map((conversation) => (
                <Link
                  href={`/admin/users/${conversation.userId}/conversations/${conversation._id}`}
                  key={conversation?._id ?? ""}
                >
                  <ConversationItem
                    {...conversation}
                    isActive={conversationId === conversation?._id}
                  />
                </Link>
              ))}
          </ul>
        </div>
      )}
      <div className="h-full w-full md:-mx-6 md:h-screen">{props.children}</div>
    </main>
  );
};
