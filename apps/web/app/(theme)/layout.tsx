import { ThemeProvider } from "@/components/context/theme-provider";
import { Toaster } from "sileo";
import { ReactNode, ViewTransition } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <ViewTransition>{children}</ViewTransition>

      <Toaster position="bottom-center" />
    </ThemeProvider>
  );
}
