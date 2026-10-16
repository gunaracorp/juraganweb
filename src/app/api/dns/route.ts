// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const domain = req.nextUrl.searchParams.get("domain");
  const type = req.nextUrl.searchParams.get("type");
  const where: Record<string, unknown> = {};
  if (domain) where.domain = domain;
  if (type) where.type = type;
  const items = await db.dNSRecord.findMany({
    where,
    orderBy: [{ domain: "asc" }, { type: "asc" }],
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.domain) return badRequest("domain required");
    if (!body.type) return badRequest("type required");
    if (!body.name) return badRequest("name required");
    if (!body.value) return badRequest("value required");
    const item = await db.dNSRecord.create({
      data: {
        domain: body.domain,
        type: body.type,
        name: body.name,
        value: body.value,
        priority: Number(body.priority) || 0,
        ttl: Number(body.ttl) || 3600,
        enabled: body.enabled !== false,
      },
    });
    await logActivity(req, auth.user, "created", "dns", item.id, `${item.name}.${item.domain}`);
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Create failed" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return badRequest("id required");
    const existing = await db.dNSRecord.findUnique({ where: { id } });
    if (!existing) return notFound("DNS record not found");
    const update: Record<string, unknown> = {};
    for (const k of ["domain", "type", "name", "value"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["priority", "ttl"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.enabled !== undefined) update.enabled = !!fields.enabled;
    const item = await db.dNSRecord.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "dns", item.id, `${item.name}.${item.domain}`);
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return badRequest("id required");
  try {
    const existing = await db.dNSRecord.findUnique({ where: { id } });
    if (!existing) return notFound("DNS record not found");
    await db.dNSRecord.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "dns", id, `${existing.name}.${existing.domain}`);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

async function logActivity(req: NextRequest, user: { username: string; name: string }, action: string, entity: string, entityId: string | null, entityTitle: string | null) {
  try {
    await db.activity.create({
      data: {
        userId: user.username,
        userName: user.name,
        action,
        entity,
        entityId: entityId || null,
        entityTitle: entityTitle || null,
        ip: req.headers.get("x-forwarded-for") || null,
      },
    });
  } catch {}
}
