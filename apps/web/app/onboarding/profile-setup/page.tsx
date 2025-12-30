import { ProfileSetupView } from "@/modules/onboarding/profile-setup/profile-setup-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil de tu hijo - Daimo",
};

const ServerPage = () => {
  return <ProfileSetupView />;
};

export default ServerPage;
