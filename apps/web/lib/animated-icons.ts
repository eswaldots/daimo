import { ICON_LIST } from "@/components/animated-icons";

type Icon = {
  name: string;
  keywords: string[];
};

/// WARNING: ONLY CAN BE CALLED ON SERVER SIDE
const getAnimatedIcons = (): Icon[] => {
  return ICON_LIST.map(({ name, keywords }) => ({
    name,
    keywords,
  }));
};

export { getAnimatedIcons };
export type { Icon as AnimatedIcon };
