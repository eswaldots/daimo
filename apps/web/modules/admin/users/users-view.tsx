"use client";

import SearchInput from "@/components/layout/search-input";
import { useGetUsers } from "../hooks/queries";
import { DataTable } from "@/components/ui/data-table";
import { userColums } from "./components/users-columns";

const UsersView = () => {
  const { data } = useGetUsers();

  return (
    <main>
      <h1 className="text-3xl font-semibold tracking-tighter">Usuarios</h1>

      <SearchInput className="my-6" placeholder="Busca a usuarios por nombre" />

      {data && <DataTable columns={userColums} data={data} />}
    </main>
  );
};

export { UsersView };
