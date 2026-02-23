import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ParentalSidebar from "./parental-sidebar";
import { ReactNode } from "react";
import { Trigger } from "@/components/layout/home/trigger";
import { ParentalHeader } from "./parental-header";

/**
 * Render the authenticated home layout (sidebar, header sizing, and main content) or redirect to the root path when no session is found.
 *
 * @param children - The main page content to render inside the layout
 * @returns The layout element containing the sidebar and main content when a session exists; otherwise triggers a redirect to `/`
 */
export default function ParentalLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="flex flex-col bg-transparent"
    >
      <div className="flex flex-1 bg-background">
        <ParentalSidebar />
        <SidebarInset className="relative dark:bg-background bg-secondary/50 overflow-y-hidden max-h-screen">
          <ParentalHeader />
          <div className="flex flex-1 flex-col mx-auto w-full overflow-y-auto">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-10 md:pt-4 md:pt-18 md:px-6 px-4">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
