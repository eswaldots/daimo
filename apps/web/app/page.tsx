import { Hero } from "@/components/layout/hero";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (data) {
    redirect("/home");
  } else {
    return <Hero />;
  }
}
