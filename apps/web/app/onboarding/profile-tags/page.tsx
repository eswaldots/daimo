import { ProfileTagsView } from "@/modules/onboarding/profile-tags/profile-tags-view";
import { Metadata } from "next";

export const metadata: Metadata = {
		title: "¿Qué le gusta a tu hijo? - Daimo"
}

const ServerPage = () => {
		return <ProfileTagsView />
}

export default ServerPage;
