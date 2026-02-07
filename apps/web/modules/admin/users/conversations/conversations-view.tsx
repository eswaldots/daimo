"use client";

import { api, Id } from "@daimo/backend";
import { usePaginatedQuery } from "convex-helpers/react";
import { useParams, useRouter } from "next/navigation";
import { useGetConversation } from "./hooks/queries";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageSquareIcon } from "@/components/animated-icons/message-square";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { ArrowLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Params = {
  conversationId: Id<"conversations">;
};

export const ConversationView = () => {
  return (
    <main className="max-h-[calc(100vh-56px)] md:w-full h-[calc(100vh-18px)] overflow-y-hidden">
      <ConversationHeader />
      <ConversationBody />
    </main>
  );
};

const ConversationHeader = () => {
  const { conversationId } = useParams<Params>();

  const { data, isPending } = useGetConversation(conversationId);
  const { isMobile } = useSidebar();
  const router = useRouter();

  if (isPending) {
    return <SkeletonHeader />;
  }

  return (
    <header className="py-4 md:py-5 border-b h-fit flex items-center px-6 gap-4 w-full">
      {isMobile && (
        <Button
          size="icon-sm"
          variant="ghost"
          className="-mx-2.5 active:bg-secondary"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
      )}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Avatar className="size-9">
          <AvatarImage src={data?.character?.image ?? ""} className="size-9" />
        </Avatar>
      </motion.div>
      <div>
        <div className="flex items-center gap-2">
          <motion.h1
            className="font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {data?.character?.name ?? "Nueva conversación"}
          </motion.h1>

          {data?.isLive && (
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

        <motion.p
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {data?.title ?? "Sin titulo"} ·{" "}
          {new Date(data?._creationTime ?? 0).toLocaleDateString()}
        </motion.p>
      </div>
    </header>
  );
};

const SkeletonHeader = () => {
  const { isMobile } = useSidebar();
  const router = useRouter();

  return (
    <header className="py-4 md:py-5 border-b h-fit flex items-center px-6 md:px-3 gap-4 w-full">
      {isMobile && (
        <Button
          size="icon-sm"
          variant="ghost"
          className="-mx-2.5 active:bg-secondary rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
      )}
      <Skeleton className="w-9 h-9 rounded-full"></Skeleton>
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
        </div>

        <Skeleton className="h-3 w-64 mt-1" />
      </div>
    </header>
  );
};

const ConversationBody = () => {
  const { conversationId } = useParams<Params>();

  // TODO: paginate manually so you can get the conversation data
  const { results, isLoading } = usePaginatedQuery(
    api.agent.message.getMessagesByConversationId,
    { id: conversationId },
    { initialNumItems: 20 },
  );

  if (isLoading) {
    return <SkeletonBody />;
  }

  return (
    <section className="md:p-3 h-full px-1 md:px-3">
      <Conversation className="relative size-full h-full">
        <ConversationContent className="h-full  md:max-h-[calc(100vh-100px)]">
          {results.length === 0 ? (
            <ConversationEmptyState
              description="Los mensajes apareceran aqui mediante la conversación progrese"
              icon={<MessageSquareIcon className="size-6" />}
              title="Espera un momento"
            />
          ) : (
            results.map(({ _id, content, role }, i) => (
              <motion.div
                key={_id}
                initial={{ opacity: 0 }}
                transition={{ delay: i * 0.025 }}
                animate={{ opacity: 1 }}
              >
                <Message from={role} className="rounded-full">
                  <MessageContent>{content}</MessageContent>
                </Message>
              </motion.div>
            ))
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>
    </section>
  );
};

const SkeletonBody = () => {
  return (
    <section className="p-3 h-full">
      <Conversation className="relative size-full max-h-[80vh]">
        <ConversationContent className="h-full md:max-h-[calc(100vh-100px)]">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              key={i}
            >
              <Message
                from={i % 2 === 0 ? "assistant" : "user"}
                className="rounded-full"
              >
                <MessageContent>
                  <Skeleton className="h-4 w-64" />
                </MessageContent>
              </Message>
            </motion.div>
          ))}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>
    </section>
  );
};
