"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children, ...props }: { children: ReactNode }[1]) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
