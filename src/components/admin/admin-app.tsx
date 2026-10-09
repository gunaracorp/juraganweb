"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { QueryProvider } from "@/components/providers";
import { AdminLogin } from "./admin-login";
import { AdminLayout } from "./admin-layout";

/**
 * Top-level wrapper for the entire CMS Admin back-office.
 *
 * Reads the persisted `adminToken` from the Zustand store. When there is
 * no token we render `<AdminLogin />` immediately. When there is one we
 * validate it once on mount via `GET /api/auth/session?token=…` — if the
 * server says the session is invalid we clear the token and show login.
 * Otherwise we render the full `<AdminLayout />` dashboard.
 *
 * Everything is wrapped in the shared TanStack Query provider so that all
 * child managers can use `useQuery` / `useMutation` directly.
 */
export function AdminApp() {
  const adminToken = useAppStore((s) => s.adminToken);
  const setAdminToken = useAppStore((s) => s.setAdminToken);

  // null = still validating, true = session is valid, false = need login
  const [sessionState, setSessionState] = useState<boolean | null>(
    adminToken ? null : false,
  );

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      if (!adminToken) {
        setSessionState(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/auth/session?token=${encodeURIComponent(adminToken)}`,
        );
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.ok) {
            setSessionState(true);
            return;
          }
        }
        // Invalid or expired → force re-login
        setAdminToken(null);
        setSessionState(false);
      } catch {
        if (!cancelled) setSessionState(false);
      }
    }
    validate();
    return () => {
      cancelled = true;
    };
  }, [adminToken, setAdminToken]);

  // No token at all (or session explicitly invalid) → login screen
  if (!adminToken || sessionState === false) {
    return (
      <QueryProvider>
        <AdminLogin />
      </QueryProvider>
    );
  }

  // Still validating the persisted token → loader
  if (sessionState === null) {
    return (
      <QueryProvider>
        <div className="bg-mesh flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 text-muted-foreground"
          >
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading CMS…</span>
          </motion.div>
        </div>
      </QueryProvider>
    );
  }

  // Session is valid → render the dashboard
  return (
    <QueryProvider>
      <AdminLayout />
    </QueryProvider>
  );
}
