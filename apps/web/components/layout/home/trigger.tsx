"use client";

import DaimoIcon from "@/components/icons/daimo";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Renders the mobile header bar with a sidebar toggle and centered logo/title.
 *
 * The header includes a ghost-style toggle button that opens or closes the sidebar and a centered cluster containing the Daimo icon and the title "daimo". When the current path contains "admin", an inline "for admins" label is shown next to the title. The component also ensures the mobile sidebar open state is synchronized when the pathname or related sidebar state changes.
 *
 * @returns The header element containing the mobile toggle button and centered logo/title.
 */
export function Trigger() {
  const { isMobile, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <header className="w-screen dark:bg-secondary/80 bg-transparent fixed h-12 top-0 left-0 md:hidden px-2 z-50 flex items-center">
      <Button
        variant="ghost"
        className="fixed md:hidden flex rounded-full z-50 bg-transparent"
        size="icon-lg"
        onClick={() => toggleSidebar()}
      >
        <MenuIcon className="size-5 subpixel-antialiased" />
      </Button>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <DaimoIcon className="size-4" />
        <h1 className="text-lg font-medium tracking-tight">
          daimo{" "}
          {pathname.includes("admin") && (
            <span className="text-muted-foreground font-normal">
              for admins
            </span>
          )}
        </h1>
      </div>
    </header>
  );
}

