import { useRef, useEffect } from "react";

export type ClickOutsideCallback = (event: MouseEvent) => void;

interface ConfigProps {
  clickOutsideFn: ClickOutsideCallback;
}

/**
 * Provides a ref to attach to an element and invokes a callback when a mousedown occurs outside that element.
 *
 * @param clickOutsideFn - Function called with the originating `MouseEvent` when a mousedown happens outside the attached element
 * @returns An object containing `wrapperRef`, a ref that should be attached to the element to monitor for outside clicks
 */
export default function useClickOutside<ElementType extends HTMLElement>({
  clickOutsideFn,
}: ConfigProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef<ClickOutsideCallback | null>(null);

  useEffect(() => {
    if (typeof clickOutsideFn === "function") {
      callbackRef.current = clickOutsideFn;
    }
  }, [clickOutsideFn]);

  useEffect(() => {
    const listenerCallback = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
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