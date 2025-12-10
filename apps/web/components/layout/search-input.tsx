"use client";

import { ComponentProps } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import useDebouncedCallback from "@/hooks/use-debounced-callback";
import { Input } from "../ui/input";

export default function SearchInput({
  searchParam,
  ...props
}: ComponentProps<"input"> & { searchParam?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set(searchParam ?? "q", term);
    } else {
      params.delete(searchParam ?? "q", undefined);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <Input
      {...props}
      defaultValue={searchParams.get("q")?.toString()}
      className={cn(
        "rounded-full md:w-sm text-sm border-none px-4 bg-secondary dark:bg-border",
        props.className,
      )}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
