import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";

export const useGetProfiles = () => {
  const methods = useQueryWithStatus(api.parental.profile.getProfiles);

  return methods;
};
