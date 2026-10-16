/**
 * API adapter — auto-switch between Next.js API (dev/standalone) and PHP API (shared hosting cPanel).
 *
 * Detection logic:
 * - If running on shared hosting (static export), the API base is "/hosting-api".
 * - If running in Next.js dev/standalone, the API base is "/api".
 *
 * The .htaccess in public/ also rewrites /api/* → /hosting-api/* on Apache,
 * so both paths work on shared hosting. This adapter prefers the path that
 * worked before (cached), otherwise tries /api first (Next.js), then /hosting-api.
 */

const SHARED_HOSTING_FLAG = "__JW_SHARED_HOSTING__";

function isSharedHosting(): boolean {
  if (typeof window === "undefined") return false;
  // Cached flag set once a /hosting-api/* call succeeds
  return window.localStorage.getItem(SHARED_HOSTING_FLAG) === "1";
}

function setSharedHostingMode(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) window.localStorage.setItem(SHARED_HOSTING_FLAG, "1");
  else window.localStorage.removeItem(SHARED_HOSTING_FLAG);
}

/**
 * Build the URL for an API endpoint, automatically using the right base.
 * Usage: `apiUrl("/posts?published=true")` → "/api/posts?published=true" or "/hosting-api/posts?published=true"
 */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const base = isSharedHosting() ? "/hosting-api" : "/api";
  return `${base}/${clean}`;
}

/**
 * Smart fetch with auto-fallback: tries /api/* first (Next.js mode),
 * on 404 falls back to /hosting-api/* (shared hosting). Caches the result.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // Strip query for the cache flag detection but keep for the actual call
  const target = apiUrl(path);
  let res = await fetch(target, init);
  // 404 → try the other base path
  if (res.status === 404 && !isSharedHosting()) {
    // Try /hosting-api/ fallback
    const fallback = `/hosting-api/${path.replace(/^\//, "")}`;
    const res2 = await fetch(fallback, init);
    if (res2.ok || res2.status !== 404) {
      setSharedHostingMode(true);
      return res2;
    }
    return res2;
  }
  return res;
}
