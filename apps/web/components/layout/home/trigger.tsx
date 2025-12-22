"use client";

import DaimoIcon from "@/components/icons/daimo";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Trigger() {
  const { isMobile, open, toggleSidebar, openMobile, setOpenMobile } =
    useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(true);
    }
  }, [pathname, isMobile, open]);

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
