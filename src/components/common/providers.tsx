"use client";

import { ProgressProvider } from "@bprogress/next/app";
import type React from "react";
import { ThemeProvider } from "@/components/common/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProgressProvider height="3px" options={{ showSpinner: false }}>
        {children}
      </ProgressProvider>
    </ThemeProvider>
  );
}
