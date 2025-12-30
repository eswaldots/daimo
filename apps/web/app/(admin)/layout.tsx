import AdminSidebar from "@/components/layout/admin/sidebar";
import { Trigger } from "@/components/layout/home/trigger";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/auth/session-server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const data = await getServerSession();

  if (data?.user.role === "admin")
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AdminSidebar session={data} />
        <SidebarInset className="relative dark:bg-secondary/50 bg-background md:peer-data-[variant=inset]:shadow-xs md:peer-data-[variant=inset]:rounded-lg">
          <div className="flex flex-1 flex-col mx-auto w-full">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-14 md:pt-6 pt-18 px-6">
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
