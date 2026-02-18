import { ReactNode } from "react";

const ServerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="dark:bg-background bg-background flex items-center justify-center h-screen w-screen font-sans md:px-0 px-4">
      {children}
    </div>
  );
};

export default ServerLayout;
