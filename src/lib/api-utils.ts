import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export function getToken(req: NextRequest): string | null {
  // Try Authorization header first
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  // Fallback to query param
  const url = req.nextUrl;
  const t = url.searchParams.get("token");
  return t;
}

export function requireAuth(req: NextRequest): { ok: true; user: NonNullable<ReturnType<typeof getSession>> } | { ok: false } {
  const token = getToken(req);
  const session = getSession(token);
  if (!session) return { ok: false };
  return { ok: true, user: session };
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function ok(body: unknown = { ok: true }) {
  return json(body, 200);
}

export function badRequest(msg: string) {
  return json({ ok: false, error: msg }, 400);
}

export function unauthorized(msg = "Unauthorized") {
  return json({ ok: false, error: msg }, 401);
}

export function notFound(msg = "Not found") {
  return json({ ok: false, error: msg }, 404);
}
