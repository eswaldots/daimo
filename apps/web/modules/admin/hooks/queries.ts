import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";
import { useNextPrevPaginatedQuery } from "convex-use-next-prev-paginated-query";

export const useGetUsers = ({ search }: { search?: string }) => {
  const methods = useNextPrevPaginatedQuery(
    api.auth.users.getAllUsers,
    { search },
    { initialNumItems: 10 },
  );

  return methods;
};

export const useGetConversationsByUserId = ({ userId }: { userId: string }) => {
  const methods = useQueryWithStatus(
    api.agent.conversation.getConversationsByUserId,
    { userId },
  );

  return methods;
};
