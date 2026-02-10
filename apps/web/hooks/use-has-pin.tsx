import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { api } from "@daimo/backend";

export const useHasPin = () => {
  const methods = useQueryWithStatus(api.parental.security.hasPin);

  return methods;
};
