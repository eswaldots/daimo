import LandingPage from "@/components/layout/landing";
import { fetchAuthQuery } from "@/lib/auth/auth-server";
import * as Sentry from "@sentry/nextjs";
import { getServerSession } from "@/lib/auth/session-server";
import { api } from "@daimo/backend";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  if (!session?.user) {
    return <LandingPage />;
  }

  if (session.user.completedOnboarding) {
    redirect("/home");
  }

  let onboardingStep: string;

  try {
    onboardingStep = await fetchAuthQuery(
      api.auth.onboarding.checkOnboardingRedirect,
    );

    redirect(onboardingStep);
  } catch (e) {
    Sentry.captureException(e);

    onboardingStep = "/onboarding/getting-started";

    redirect(onboardingStep);
  }
}
