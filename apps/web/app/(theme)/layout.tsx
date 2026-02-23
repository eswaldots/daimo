import { ThemeProvider } from "@/components/context/theme-provider";
import { Toaster } from "sileo";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      {children}

      <Toaster position="bottom-center" />
    </ThemeProvider>
  );
}
