"use client";

import SearchInput from "@/components/layout/search-input";
import { useGetUsers } from "../hooks/queries";
import { DataTable } from "@/components/ui/data-table";
import { userColumns } from "./components/users-columns";
import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const UsersView = () => {
  const search = useSearchParams();
  const term = search.get("q") ?? undefined;

  const data = useGetUsers({
    search: term,
  });

  return (
    <main className="">
      <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>

      <SearchInput className="my-6" placeholder="Busca a usuarios por nombre" />

      {data._tag === "Loaded" && data.page && (
        /* @ts-expect-error typescript is giving me nuts bro */
        <DataTable columns={userColumns} data={data.page} />
      )}

      {!term && data._tag === "Loaded" && (
        <div className="w-full flex items-center justify-end my-12 gap-2">
          <span className="mx-4 text-sm font-medium">
            Pagina {data.pageNum}
          </span>
          {data.loadPrev && (
            <Button onClick={data.loadPrev} variant="secondary" size="icon-lg">
              <ArrowLeft />
            </Button>
          )}
          {data.loadNext && (
            <Button onClick={data.loadNext} variant="secondary" size="icon-lg">
              <ArrowRight />
            </Button>
          )}
        </div>
      )}
    </main>
  );
};

export { UsersView };
