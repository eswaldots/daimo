import LandingPage from "@/components/layout/landing";
import { fetchAuthQuery } from "@/lib/auth/auth-server";
import { getServerSession } from "@/lib/auth/session-server";
import { api } from "@daimo/backend";
import logger from "@daimo/logger";
import { redirect } from "next/navigation";

const log = logger.getSubLogger({ prefix: ["getServerSession"] });

export default async function Home() {
  const  session  = await getServerSession();

  if (!session?.user) {
    return <LandingPage />
  }

  if (session.user.completedOnboarding) {
		  redirect("/home")
  }

const onboardingStep = await fetchAuthQuery(api.auth.onboarding.checkOnboardingRedirect); 

redirect(onboardingStep);
}
