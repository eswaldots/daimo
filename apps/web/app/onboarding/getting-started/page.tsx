import { OnboardingView } from "@/modules/onboarding/getting-started/onboarding-view"
import { Metadata } from "next";

export const metadata: Metadata = {
		title: "Bienvenido a Daimo - Daimo"
}

const ServerPage = () => {
		return <OnboardingView />
}

export default ServerPage;
