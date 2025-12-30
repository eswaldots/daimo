import { OnboardingView } from "@/modules/admin/onboarding/onboarding-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Daimo for admins",
};

const ServerPage = () => {
  return <OnboardingView />;
};

export default ServerPage;
