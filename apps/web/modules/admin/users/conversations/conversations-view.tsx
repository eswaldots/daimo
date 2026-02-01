"use client";

import { api } from "@daimo/backend";
import { Preloaded, usePreloadedQuery } from "convex/react";

export const ConversationsView = (props: {
  preloadedConversations: Preloaded<
    typeof api.agent.conversation.getConversationsByUserId
  >;
}) => {
  const conversations = usePreloadedQuery(props.preloadedConversations);

  return (
    <main className="max-w-3xl w-full mx-auto">
      <h1 className="text-2xl font-semibold tracking-tighter">
        Conversaciones
      </h1>
    </main>
  );
};
