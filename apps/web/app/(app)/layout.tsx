import HomeSidebar from "@/components/layout/home/sidebar";
import { Trigger } from "@/components/layout/home/trigger";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/auth/session-server";
import { redirect } from "next/navigation";
import { ReactNode, ViewTransition } from "react";

/**
 * Render the authenticated home layout (sidebar, header sizing, and main content) or redirect to the root path when no session is found.
 *
 * @param children - The main page content to render inside the layout
 * @returns The layout element containing the sidebar and main content when a session exists; otherwise triggers a redirect to `/`
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const data = await getServerSession();

  if (!data) {
    redirect("/");
  }

  if (!data.user.completedOnboarding) {
    redirect("/onboarding/getting-started");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <HomeSidebar session={data} />
      <SidebarInset className="relative dark:bg-muted bg-background">
        <div className="flex flex-1 flex-col mx-auto w-full">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-10 md:pt-8 pt-18 md:px-10 px-4">
              <Trigger />
              <ViewTransition>{children}</ViewTransition>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
