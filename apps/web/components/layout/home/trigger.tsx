"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuIcon } from "lucide-react";

export function Trigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="outline"
      className="left-4 top-4 fixed md:hidden flex rounded-full bg-background/90 backdrop-blur-lg z-50"
      size="icon-lg"
      onClick={() => toggleSidebar()}
    >
      <MenuIcon className="size-5 subpixel-antialiased" />
    </Button>
  );
}
