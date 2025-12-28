import LandingPage from "@/components/layout/landing";
import { authClient } from "@/lib/auth-client";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@daimo/backend";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.user) {
    return <LandingPage />
  }

  if (session.user.completedOnboarding) {
		  redirect("/home")
  }

const onboardingStep = await fetchAuthQuery(api.auth.onboarding.checkOnboardingRedirect); 

redirect(onboardingStep);
}
