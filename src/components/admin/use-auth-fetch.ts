"use client";

import { useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { apiFetch } from "@/lib/api-client";

/**
 * Returns a `fetchWithAuth` function that injects the admin bearer token
 * (from the Zustand store) into every request. If the server returns 401,
 * the token is automatically cleared so the user is sent back to the login
 * screen.
 *
 * Internally uses the shared `apiFetch` adapter so the request
 * automatically goes through `/api/*` (Next.js dev) or `/hosting-api/*`
 * (shared hosting / cPanel). The `input` may be passed with or without
 * the `/api` prefix; the prefix is stripped before delegating to
 * `apiFetch` (which adds the correct base itself).
 *
 * Usage:
 *   const fetchWithAuth = useAuthFetch();
 *   const res = await fetchWithAuth("/api/posts", { method: "POST", body: JSON.stringify(payload) });
 *   // or without the prefix:
 *   const res = await fetchWithAuth("/posts", { method: "POST", body: JSON.stringify(payload) });
 */
export function useAuthFetch() {
  return useCallback(
    async (input: string, init: RequestInit = {}) => {
      // Strip leading /api if the caller passed it; apiFetch adds the
      // correct base (/api or /hosting-api) itself.
      const path = input.replace(/^\/api\//, "/");
      const headers = new Headers(init.headers || {});
      const token = useAppStore.getState().adminToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const res = await apiFetch(path, { ...init, headers });
      if (res.status === 401) {
        useAppStore.getState().setAdminToken(null);
      }
      return res;
    },
    [],
  );
}
