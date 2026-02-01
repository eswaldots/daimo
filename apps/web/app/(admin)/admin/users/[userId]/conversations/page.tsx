import { fetchAuthQuery, preloadAuthQuery } from "@/lib/auth/auth-server";
import { ConversationsView } from "@/modules/admin/users/conversations/conversations-view";
import { api } from "@daimo/backend";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ userId: string }>;
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

const ServerPage = async ({ params }: Props) => {
  const { userId } = await params;
  const preloaded = await preloadAuthQuery(
    api.agent.conversation.getConversationsByUserId,
    { userId },
  );

  return <ConversationsView preloadedConversations={preloaded} />;
};

export default ServerPage;
