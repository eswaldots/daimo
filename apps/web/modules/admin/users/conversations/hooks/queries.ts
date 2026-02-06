import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";

export const useGetConversation = (id: Id<"conversationId">) => {
  const methods = useQueryWithStatus(
    api.agent.conversation.getConversationById,
    { id },
  );

  return methods;
};
