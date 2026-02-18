import { api } from "@daimo/backend";
import { useMutation } from "convex/react";

export const useSetProfile = () => {
  const methods = useMutation(api.parental.profile.setActiveProfile);

  return methods;
};
