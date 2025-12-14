"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import {
  useMaybeRoomContext,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type DeviceSelectProps = React.ComponentProps<typeof SelectTrigger> & {
  kind: MediaDeviceKind;
  variant?: "default" | "small";
  track?: LocalAudioTrack | LocalVideoTrack | undefined;
  requestPermissions?: boolean;
  onMediaDeviceError?: (error: Error) => void;
  onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
};

const selectVariants = cva(
  "w-full rounded-full px-3 py-2 text-sm cursor-pointer disabled:not-allowed",
  {
    variants: {
      size: {
        default: "w-[180px]",
        sm: "w-auto",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export function TrackDeviceSelect({
  kind,
  track,
  size = "default",
  requestPermissions = false,
  onMediaDeviceError,
  onDeviceListChange,
  onActiveDeviceChange,
  ...props
}: DeviceSelectProps) {
  const room = useMaybeRoomContext();
  const [open, setOpen] = useState(false);
  const [requestPermissionsState, setRequestPermissionsState] =
    useState(requestPermissions);
  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({
      room,
      kind,
      track,
      requestPermissions: requestPermissionsState,
      onError: onMediaDeviceError,
    });

  useEffect(() => {
    onDeviceListChange?.(devices);
  }, [devices, onDeviceListChange]);

  // When the select opens, ensure that media devices are re-requested in case when they were last
  // requested, permissions were not granted
  useLayoutEffect(() => {
    if (open) {
      setRequestPermissionsState(true);
    }
  }, [open]);

  const handleActiveDeviceChange = (deviceId: string) => {
    setActiveMediaDevice(deviceId);
    onActiveDeviceChange?.(deviceId);
  };

  const filteredDevices = useMemo(
    () => devices.filter((d) => d.deviceId !== ""),
    [devices],
  );

  if (filteredDevices.length < 2) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(selectVariants({ size }), props.className)}
        asChild
      >
        <Button size="icon" variant="secondary">
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg">
        {filteredDevices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            onSelect={() => handleActiveDeviceChange(device.deviceId)}
          >
            {device.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
