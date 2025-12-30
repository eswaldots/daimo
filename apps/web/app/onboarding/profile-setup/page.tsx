import { ProfileSetupView } from "@/modules/onboarding/profile-setup/profile-setup-view";
import { Metadata } from "next";

export const metadata: Metadata = {
		title: "¿Quién usará Daimo? - Daimo"
}

const ServerPage = () => {
		return <ProfileSetupView />
}

export default ServerPage;
