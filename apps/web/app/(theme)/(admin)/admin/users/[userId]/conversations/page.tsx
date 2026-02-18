import { preloadAuthQuery } from "@/lib/auth/auth-server";
import { ConversationsListView } from "@/modules/admin/users/conversations/conversations-list-view";
import { api } from "@daimo/backend";
import { cache } from "react";

type Props = {
  params: Promise<{ userId: string; conversationId: string }>;
};

const preload = cache(async (userId: string) => {
  return await preloadAuthQuery(
    api.agent.conversation.getConversationsByUserId,
    { userId },
  );
});

const ServerPage = async ({ params }: Props) => {
  const { userId } = await params;
  const preloaded = await preload(userId);

  return <ConversationsListView preloadedConversations={preloaded} />;
};

export default ServerPage;
