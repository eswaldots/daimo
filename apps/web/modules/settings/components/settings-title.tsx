import { ReactNode } from "react";

export const SettingsTitle = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-2xl font-medium tracking-tight">{children}</h1>;
};
