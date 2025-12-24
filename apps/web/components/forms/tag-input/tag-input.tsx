"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import useClickOutside from "@/hooks/use-click-outside";
import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";
import { XIcon } from "lucide-react";
import { ComponentProps, useMemo, useRef, useState } from "react";

/**
 * Renders a tag input UI that lets users type, select suggested tags, and manage selected tags as removable chips.
 *
 * The component fetches tag suggestions based on the current input, shows a popover list of suggestions, allows
 * adding suggestions or freeform values as tags, and supports keyboard interactions for completion and removal.
 *
 * @returns A JSX element containing the tag input control with selected tag chips, an input, and a suggestion popover.
 */
function TagInput() {
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<string[]>([]);
  const { data: tags, isPending } = useQueryWithStatus(api.tags.list, {
    searchTerm: value ?? undefined,
  });
  const [isOpen, setIsOpen] = useState(false);
  const { wrapperRef: ref } = useClickOutside({
    clickOutsideFn: () => {
      setIsOpen(false);
    },
  });

  const filteredTags = useMemo(() => {
    if (!tags) return [];

    return tags.filter((tag) => {
      const isAlreadySelected = values.includes(tag.name);
      return !isAlreadySelected;
    });
  }, [tags, values]);

  const handleCompletion = () => {
    if (!filteredTags || !filteredTags[0]) return;

    setValues([...values, filteredTags[0].name]);
    setValue("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Popover open={isOpen}>
      <PopoverTrigger>
        <InputGroup
          onClick={() => {
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            setIsOpen(true);

            if (e.key === "Backspace" && value.length === 0) {
              if (values.length === 1) {
                setValues([]);

                return;
              }
              setValues(values.filter((_, i) => i !== value.length + 1));
            }

            if (e.key === "Escape") {
              setIsOpen(false);

              inputRef?.current?.blur();
            }

            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();

              handleCompletion();
            }
            if (e.key === "Tab") {
              e.preventDefault();
              e.stopPropagation();

              handleCompletion();
            }
            if (e.key === " ") {
              e.preventDefault();
              if (value.length === 0 || value.includes(" ")) return;

              setValues([...values, value]);
              setValue("");
            }
          }}
        >
          <div className="flex items-center">
            {values.map((value, idx) => (
              <InputGroupAddon
                key={value}
                className="gap-1 bg-primary/5 rounded-full text-xs group flex items-center cursor-pointer justify-center px-2 py-1 mx-1 text-foreground last:mr-0"
                onClick={() => {
                  setValues(values.filter((_, i) => i !== idx));
                }}
              >
                <XIcon className="size-3 text-muted-foreground group-hover:text-foreground" />
                <span>{value}</span>
              </InputGroupAddon>
            ))}
          </div>
          <InputGroupInput
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </InputGroup>
      </PopoverTrigger>
      {filteredTags.length !== 0 && !isPending && (
        <PopoverContent
          className="md:w-64 outline-none p-1 flex flex-col space-y-1"
          ref={ref}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          {isPending && !tags
            ? Array.from({ length: 5 }).map((_, i) => (
                <PopoverMenuSkeletonItem key={i} />
              ))
            : filteredTags &&
              filteredTags.map(({ slug }) => (
                <PopoverMenuItem
                  onClick={() => {
                    setValues([...values, slug]);

                    setIsOpen(false);

                    inputRef?.current?.focus();
                  }}
                  key={slug}
                >
                  {slug}
                </PopoverMenuItem>
              ))}
        </PopoverContent>
      )}
    </Popover>
  );
}

/**
 * Renders a skeleton placeholder sized and styled to match a popover menu item.
 *
 * @returns A Skeleton element with full width, rounded corners, and a fixed height to represent a loading menu row.
 */
function PopoverMenuSkeletonItem() {
  return <Skeleton className="w-full rounded-lg h-8" />;
}

/**
 * Renders a styled button suitable for use as an item inside a popover menu.
 *
 * @param props - Standard button props (including `children`) forwarded to the underlying Button.
 * @returns A Button element styled as a compact, left-aligned popover menu item.
 */
function PopoverMenuItem({ children, ...props }: ComponentProps<"button">) {
  return (
    <Button
      {...props}
      className="font-normal justify-start rounded-lg first:bg-accent"
      variant="ghost"
      size="sm"
    >
      {children}
    </Button>
  );
}

export { TagInput };