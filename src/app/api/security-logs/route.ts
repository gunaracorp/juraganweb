// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const type = req.nextUrl.searchParams.get("type");
  const severity = req.nextUrl.searchParams.get("severity");
  const userId = req.nextUrl.searchParams.get("userId");
  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (userId) where.userId = userId;
  const items = await db.securityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return json({ ok: true, items });
}

// Logs are auto-created by system; no POST or PUT exposed.

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  const all = req.nextUrl.searchParams.get("all") === "true";
  try {
    if (all) {
      const r = await db.securityLog.deleteMany({});
      return json({ ok: true, deleted: r.count });
    }
    if (!id) return badRequest("id required");
    const existing = await db.securityLog.findUnique({ where: { id } });
    if (!existing) return notFound("Log not found");
    await db.securityLog.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}
