"use client";

import { api } from "@daimo/backend";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useParams } from "next/navigation";
import { ConversationItem } from "./components/conversation-item";
import { InfoIcon } from "lucide-react";
import { motion } from "motion/react";

export const ConversationsListView = (props: {
  preloadedConversations: Preloaded<
    typeof api.agent.conversation.getConversationsByUserId
  >;
}) => {
  const { conversations, user } = usePreloadedQuery(
    props.preloadedConversations,
  );

  const { conversationId } = useParams();

  return (
    <main className="flex items-start gap-6 h-full flex-col mt-8 px-2">
      <motion.h1
        className="text-2xl font-semibold tracking-tight px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Conversaciones de {user.name.split(" ")[0]}
      </motion.h1>

      {/* TODO: implement a grep search through messages like whatsapp grep search*/}

      {/* <div className="px-2 w-full -mt-2">
        <SearchInput placeholder="Buscar conversaciones" className="w-full" />
      </div>
*/}

      <ul className="w-full space-y-2 h-full">
        {conversations
          .filter((conversation) => !!conversation)
          .map((conversation, i) => (
            <motion.div
              className="flex flex-col active:bg-secondary rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={conversation?._id}
              transition={{ delay: i * 0.025 + 0.25 }}
            >
              <div className="flex items-center justify-between pr-3">
                <ConversationItem
                  {...conversation}
                  key={conversation._id}
                  isActive={conversationId === conversation._id}
                />

                <InfoIcon className="size-6 text-accent" strokeWidth={1.25} />
              </div>
              <div className="w-full border-t border-border [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"></div>
            </motion.div>
          ))}
      </ul>
    </main>
  );
};
