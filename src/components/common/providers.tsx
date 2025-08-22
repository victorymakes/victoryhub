"use client";

import React from "react";
import { ThemeProvider } from "@/components/common/theme-provider";
import { ProgressProvider } from "@bprogress/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <ProgressProvider options={{ showSpinner: false }}>
                {children}
            </ProgressProvider>
        </ThemeProvider>
    );
}
