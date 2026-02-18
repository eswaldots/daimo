import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";

export const useProfile = () => {
  const methods = useQueryWithStatus(api.parental.profile.getCurrentProfile);

  return methods;
};
