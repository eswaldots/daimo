"use client";

import SearchInput from "@/components/layout/search-input";
import { useIsMobile } from "@/hooks/use-mobile";
import { api, Doc } from "@daimo/backend";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { ConversationItem } from "./conversation-item";

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
    <main className="flex items-center gap-6 max-h-screen md:-ml-6 -mt-8 md:-mt-6 -mx-4 md:-mx-3 md:overflow-y-hidden overflow-x-hidden md:max-w-[calc(100vw-var(--sidebar-width))]!">
      {!isMobile && (
        <div className="flex flex-col items-start bg-background w-sm ml-1 h-screen border-r border-border py-4 px-4">
          <h1 className="text-lg font-medium tracking-tight">
            Historial de Aaron Avila
          </h1>

          <SearchInput
            placeholder="Buscar en el historial"
            className="md:w-full my-4 rounded-md"
          />

          <ul className="h-full overflow-y-scroll w-full space-y-1">
            {conversations
              .filter((conversation) => !!conversation)
              .map((conversation) => (
                <ConversationItem
                  {...conversation}
                  key={conversation?._id ?? ""}
                  isActive={conversationId === conversation?._id}
                />
              ))}
          </ul>
        </div>
      )}
      <div className="h-full w-full md:-mx-6 md:h-screen">{props.children}</div>
    </main>
  );
};
