"use client";

import SearchInput from "@/components/layout/search-input";
import { useGetUsers } from "../hooks/queries";
import { DataTable } from "@/components/ui/data-table";
import { userColums } from "./components/users-columns";
import { useSearchParams } from "next/navigation";

const UsersView = () => {
  const search = useSearchParams();

  const { data } = useGetUsers({ search: search.get("q") ?? undefined });

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>

      <SearchInput className="my-6" placeholder="Busca a usuarios por nombre" />

      {data && <DataTable columns={userColums} data={data} />}
    </main>
  );
};

export { UsersView };
