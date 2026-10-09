"use client";
import { type ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { QueryProvider } from "@/components/site/query-provider";

/**
 * Layout bersama untuk semua halaman marketing publik (multi-page).
 * Header sticky di atas, footer sticky di bawah (flex min-h-screen flex-col + main flex-1).
 */
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pt-16">{children}</main>
        <SiteFooter />
      </div>
    </QueryProvider>
  );
}
