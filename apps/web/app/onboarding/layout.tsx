import { getServerSession } from "@/lib/auth/session-server";
import { OnboardingLayout } from "@/modules/onboarding/components/onboarding-layout";
import { redirect } from "next/navigation";
import { ReactNode, ViewTransition } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.completedOnboarding) {
    redirect("/home");
  }

  return (
    <ViewTransition>
      <OnboardingLayout>{children}</OnboardingLayout>
    </ViewTransition>
  );
}
