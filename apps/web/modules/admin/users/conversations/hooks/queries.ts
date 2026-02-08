import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api, Id } from "@daimo/backend";

export const useGetConversation = (id: Id<"conversations">) => {
  const methods = useQueryWithStatus(
    api.agent.conversation.getConversationById,
    { id },
  );

  return methods;
};
