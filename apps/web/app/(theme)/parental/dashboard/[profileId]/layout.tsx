import ParentalLayout from "@/modules/parental/dashboard/components/parental-layout";
import { ReactNode } from "react";

const ServerLayout = ({ children }: { children: ReactNode }) => {
  return <ParentalLayout>{children}</ParentalLayout>;
};

export default ServerLayout;
