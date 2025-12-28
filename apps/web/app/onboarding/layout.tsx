import { OnboardingLayout } from "@/modules/onboarding/components/onboarding-layout";
import  { ReactNode, ViewTransition } from "react";

export default function Layout({ children}: { children: ReactNode }) {
		return (
				<ViewTransition>
				<OnboardingLayout>
				{children}
				</OnboardingLayout>
				</ViewTransition>
		)
}

