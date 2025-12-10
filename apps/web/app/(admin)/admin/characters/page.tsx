"use client";

import { charactersColumns } from "@/components/characters/columns";
import { EmptyCharacter } from "@/components/layout/home/empty-character";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { api } from "@daimo/backend";
import { usePaginatedQuery } from "convex/react";
import Link from "next/link";

export default function Page() {
  const { results: characters, isLoading } = usePaginatedQuery(
    api.characters.getMyCharacters,
    {},
    { initialNumItems: 10 },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-2xl font-medium tracking-tight">Personajes</h1>

        <Button className="rounded-full" asChild>
          <Link href="/admin/characters/create">Crear personaje</Link>
        </Button>
      </div>

      <Input
        className="rounded-full md:w-sm text-sm border-none px-4 hover:bg-input transition-colors bg-secondary dark:bg-border"
        placeholder="Buscar personajes"
      />

      <DataTable columns={charactersColumns} data={characters} />

      {!isLoading && characters.length === 0 && <EmptyCharacter />}
    </div>
  );
}
