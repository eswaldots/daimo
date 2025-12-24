"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

/**
 * Wraps Radix UI's Popover.Root and applies a standardized `data-slot="popover"` attribute.
 *
 * @param props - All props are forwarded to the underlying Radix Popover.Root component.
 * @returns The Popover Root element with `data-slot="popover"` and the provided props applied.
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/**
 * Renders a wrapper around the Radix Popover Trigger that forwards all props and sets `data-slot="popover-trigger"`.
 *
 * @returns The React element for the popover trigger.
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * Renders styled popover content inside a Radix Portal.
 *
 * @param className - Additional CSS class names appended to the default popover styling.
 * @param align - Alignment of the popover content relative to its trigger (e.g., "center", "start", "end").
 * @param sideOffset - Distance in pixels between the trigger and the popover content.
 * @returns The rendered popover content element.
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-xl border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/**
 * Renders a Radix Popover Anchor with a standardized `data-slot` attribute.
 *
 * @returns The JSX element for `PopoverPrimitive.Anchor` with `data-slot="popover-anchor"` and all forwarded props.
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };