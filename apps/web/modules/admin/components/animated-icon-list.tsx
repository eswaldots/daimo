"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";

import { AnimatedIcon } from "@/lib/animated-icons";
import { ICON_LIST } from "@/components/animated-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

type Props = {
  icons: AnimatedIcon[];
  setAnimatedIcon: (icon: AnimatedIcon) => void;
};

const ICON_MAP = new Map(ICON_LIST.map((item) => [item.name, item.icon]));

const AnimatedIconItem = ({
  icon,
  AnimatedIcon,
  setAnimatedIcon,
}: {
  icon: AnimatedIcon;
  setAnimatedIcon: (icon: AnimatedIcon) => void;
  AnimatedIcon: React.ElementType;
}) => {
  const animationRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  return (
    <div
      key={icon.name}
      onClick={() => {
        setAnimatedIcon(icon);
      }}
      onMouseEnter={() => animationRef.current?.startAnimation()}
      onMouseLeave={() => animationRef.current?.stopAnimation()}
      className="p-1 hover:bg-secondary w-fit rounded-lg cursor-pointer"
    >
      <AnimatedIcon ref={animationRef} className="[&>svg]:size-5" />
    </div>
  );
};

const AnimatedIconsList = ({ icons, setAnimatedIcon }: Props) => {
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const fuse = useMemo(
    () =>
      new Fuse(icons, {
        keys: [
          { name: "name", weight: 3 },
          { name: "keywords", weight: 2 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
        findAllMatches: true,
        isCaseSensitive: false,
        minMatchCharLength: 2,
      }),
    [icons],
  );

  const filteredAnimatedIcons = useMemo(() => {
    if (!deferredSearchValue.trim()) return icons;
    return fuse.search(deferredSearchValue).map((result) => result.item);
  }, [fuse, icons, deferredSearchValue]);

  return (
    <div className="w-full">
      <Input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Busca iconos..."
        className="h-7 text-xs max-w-full rounded-md mb-4"
      />

      <ScrollArea>
        <div className="flex flex-wrap gap-1 max-h-64">
          {filteredAnimatedIcons.length === 0 && (
            <div className="col-span-full pt-10 text-center text-sm text-neutral-500">
              No se encontraron iconos
            </div>
          )}
          {filteredAnimatedIcons.map((icon) => {
            const IconComponent = ICON_MAP.get(icon.name);
            if (!IconComponent) return null;
            return (
              <AnimatedIconItem
                setAnimatedIcon={setAnimatedIcon}
                key={icon.name}
                icon={icon}
                AnimatedIcon={IconComponent}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export { AnimatedIconsList };
