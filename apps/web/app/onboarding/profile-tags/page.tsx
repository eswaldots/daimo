import { ICON_LIST } from "@/components/animated-icons";
import { ProfileTagsView } from "@/modules/onboarding/profile-tags/profile-tags-view";
import { api } from "@daimo/backend";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Qué le gusta a tu hijo? - Daimo",
};

const ICON_MAP = new Map(ICON_LIST.map((item) => [item.name, item.icon]));

const ServerPage = async () => {
  const profileTags = await fetchQuery(api.auth.onboarding.getOnboardingTags);

  const icons = profileTags
    .map((tag) => ({
      icon: ICON_MAP.get(tag.icon),
      name: tag.name,
      tags: tag.tagsId,
    }))
    .filter((tag) => !!tag.icon);

  return <ProfileTagsView icons={icons} />;
};

export default ServerPage;
