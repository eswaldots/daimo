import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";

export const useGetUsers = ({ search }: { search?: string }) => {
  const methods = useQueryWithStatus(api.auth.users.getAllUsers, { search });

  return methods;
};

export const useGetConversationsByUserId = ({ userId }: { userId: string }) => {
  const methods = useQueryWithStatus(
    api.agent.conversation.getConversationsByUserId,
    { userId },
  );

  return methods;
};
