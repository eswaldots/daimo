import { fetchAuthQuery, preloadAuthQuery } from "@/lib/auth/auth-server";
import { ConversationsLayout } from "@/modules/admin/users/conversations/components/conversations-layout";
import { api } from "@daimo/backend";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, ReactNode } from "react";

type Props = {
  params: Promise<{ userId: string; conversationId: string }>;
  children: ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;

  const user = await fetchAuthQuery(api.auth.users.getById, {
    id: userId,
  });

  if (!user) {
    notFound();
  }

  return {
    title: `Conversaciones de ${user.name.split(" ")[0]} | Daimo for admins`,
  };
}

const preload = cache(async (userId: string) => {
  return await preloadAuthQuery(
    api.agent.conversation.getConversationsByUserId,
    { userId },
  );
});

const ServerPage = async ({ params, children }: Props) => {
  const { userId } = await params;
  const preloaded = await preload(userId);

  return (
    <ConversationsLayout preloadedConversations={preloaded}>
      {children}
    </ConversationsLayout>
  );
};

export default ServerPage;
