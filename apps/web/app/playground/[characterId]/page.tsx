import { headers } from "next/headers";
import { getAppConfig } from "@/lib/utils";
import { Playground } from "@/components/playground/playground";

export default async function Page() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <Playground appConfig={appConfig} />;
}
