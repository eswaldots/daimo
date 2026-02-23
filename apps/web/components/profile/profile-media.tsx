import { ComponentProps, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface ProfileMediaProps {
  src?: string;
  /// entire name string
  fallback: string;
  profileId: string;
}

const profileMediaVariants = cva("", {
  variants: {
    size: {
      sm: "size-6",
      default: "size-8",
      lg: " size-24 text-4xl font-medium",
      xl: " size-28 text-5xl font-medium",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const ProfileMedia = ({
  fallback,
  profileId,
  src,
  size,
  className,
  ...props
}: ComponentProps<typeof Avatar> &
  ProfileMediaProps &
  VariantProps<typeof profileMediaVariants>) => {
  return (
    <Avatar
      {...props}
      className={cn(profileMediaVariants({ size, className }))}
    >
      <AvatarImage src={src ?? ""} />
      <Lettermark profileId={profileId} fallback={fallback} />
    </Avatar>
  );
};

const Lettermark = ({
  fallback,
  profileId,
}: {
  fallback: string;
  profileId: string;
}) => {
  const color = useMemo(() => {
    return generateColor(profileId);
  }, [profileId]);

  return (
    <AvatarFallback
      style={{
        background: `hsla(${color}, 0.1)`,
        color: `hsl(${color})`,
      }}
    >
      {fallback.charAt(0)}
    </AvatarFallback>
  );
};

const generateColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `${hue}, 65%, 50%`;
};
