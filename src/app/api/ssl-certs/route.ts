// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const domain = req.nextUrl.searchParams.get("domain");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (domain) where.domain = domain;
  const items = await db.sSLCertificate.findMany({
    where,
    orderBy: { validTo: "asc" },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.domain) return badRequest("domain required");
    const now = new Date();
    const validFrom = body.validFrom ? new Date(body.validFrom) : now;
    const validTo = body.validTo ? new Date(body.validTo) : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const item = await db.sSLCertificate.create({
      data: {
        domain: body.domain,
        type: body.type || "dv",
        issuer: body.issuer || "Let's Encrypt",
        validFrom,
        validTo,
        autoRenew: body.autoRenew !== false,
        status: body.status || "active",
      },
    });
    await logActivity(req, auth.user, "created", "ssl", item.id, item.domain);
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
    const existing = await db.sSLCertificate.findUnique({ where: { id } });
    if (!existing) return notFound("SSL certificate not found");
    const update: Record<string, unknown> = {};
    for (const k of ["domain", "type", "issuer", "status"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.autoRenew !== undefined) update.autoRenew = !!fields.autoRenew;
    if (fields.validFrom !== undefined) update.validFrom = fields.validFrom ? new Date(fields.validFrom) : null;
    if (fields.validTo !== undefined) update.validTo = fields.validTo ? new Date(fields.validTo) : null;
    const item = await db.sSLCertificate.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "ssl", item.id, item.domain);
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
    const existing = await db.sSLCertificate.findUnique({ where: { id } });
    if (!existing) return notFound("SSL certificate not found");
    await db.sSLCertificate.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "ssl", id, existing.domain);
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
