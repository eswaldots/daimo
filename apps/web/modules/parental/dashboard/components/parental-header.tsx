"use client";

import SearchInput from "@/components/layout/search-input";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { PARENTAL_DASHBOARD_ROUTES } from "../../consts";

// TODO: use real breadcrumbs here

export const ParentalHeader = () => {
  const { title } = useBreadcrumbs();

  return (
    <header className="py-3 px-6 border-b border-border flex items-center justify-between bg-background">
      <h1 className="font-medium tracking-tight">{title}</h1>

      <SearchInput
        className="shadow-none border border-border rounded-md bg-secondary"
        placeholder="Buscar mensajes o conversaciones"
      />
    </header>
  );
};

const useBreadcrumbs = () => {
  const pathname = usePathname();
  const { profileId } = useParams();

  const title = useMemo(() => {
    return PARENTAL_DASHBOARD_ROUTES.find(
      (route) =>
        route.path.replace(":profileId", profileId as string) === pathname,
    )?.title;
  }, [pathname]);

  return { title };
};
