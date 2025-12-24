import { useRef, useEffect } from "react";

export type ClickOutsideCallback = (event: MouseEvent) => void;

interface ConfigProps {
  clickOutsideFn: ClickOutsideCallback;
}

export default function useClickOutside<ElementType extends HTMLElement>({
  clickOutsideFn,
}: ConfigProps) {
  const wrapperRef = useRef<ElementType | null>(null);
  const callbackRef = useRef<ClickOutsideCallback | null>(null);

  useEffect(() => {
    if (typeof clickOutsideFn === "function") {
      callbackRef.current = clickOutsideFn;
    }
  }, [clickOutsideFn]);

  useEffect(() => {
    const listenerCallback = (event: MouseEvent) => {
      const target = event.target;
      if (target && !wrapperRef.current?.contains(target as Node)) {
        callbackRef.current?.(event);
      }
    };

    window.addEventListener("mousedown", listenerCallback);

    return () => {
      // It's usually a good idea to remove, here, our event listeners.
      window.removeEventListener("mousedown", listenerCallback);
    };
  }, []);

  return { wrapperRef };
}
