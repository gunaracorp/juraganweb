import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, unauthorized, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const entity = req.nextUrl.searchParams.get("entity");
  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);
  const where: Record<string, unknown> = {};
  if (entity) where.entity = entity;

  const items = await db.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });
  return json({ ok: true, items });
}
