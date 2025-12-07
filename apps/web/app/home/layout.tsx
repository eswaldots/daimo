import HomeSidebar from "@/components/layout/home/sidebar";
import { Trigger } from "@/components/layout/home/trigger";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (data)
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <HomeSidebar session={data} />
        <SidebarInset className="relative dark:bg-muted bg-background">
          <div className="flex flex-1 flex-col max-w-7xl mx-auto w-full">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-14 md:pt-14 pt-18 px-6">
                <Trigger />
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  else {
    redirect("/");
  }
}
