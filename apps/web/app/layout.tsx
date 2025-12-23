import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/context/theme-provider";
import { ConvexClientProvider } from "@/components/context/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Inter_Tight({
  variable: "--font-inter-tight",
  display: "swap",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Daimo",
  description: "Daimo es una plataforma de agentes de IA conversacionales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
