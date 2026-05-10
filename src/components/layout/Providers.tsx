"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { RouteScrollToTop } from "./RouteScrollToTop";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RouteScrollToTop />
      {children}
    </ThemeProvider>
  );
}
