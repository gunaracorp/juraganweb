// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function genCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function uniqueCode(): Promise<string> {
  let code = genCode();
  let attempts = 0;
  while (await db.affiliate.findUnique({ where: { code } }) && attempts < 20) {
    code = genCode();
    attempts++;
  }
  return code;
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const items = await db.affiliate.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) return badRequest("name required");
    if (!body.email) return badRequest("email required");
    const code = body.code ? String(body.code).toUpperCase() : await uniqueCode();
    const existing = await db.affiliate.findUnique({ where: { code } });
    if (existing) return badRequest("Affiliate code already exists");
    const item = await db.affiliate.create({
      data: {
        code,
        customerId: body.customerId || null,
        name: body.name,
        email: body.email,
        commissionRate: Number(body.commissionRate) || 10,
        status: body.status || "active",
      },
    });
    await logActivity(req, auth.user, "created", "affiliate", item.id, item.code);
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
    const existing = await db.affiliate.findUnique({ where: { id } });
    if (!existing) return notFound("Affiliate not found");
    const update: Record<string, unknown> = {};
    for (const k of ["customerId", "name", "email", "status"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.commissionRate !== undefined) update.commissionRate = Number(fields.commissionRate);
    for (const k of ["totalClicks", "totalSignups", "totalSales"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    for (const k of ["totalCommission", "paidOut", "balance"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.code && fields.code !== existing.code) {
      const dup = await db.affiliate.findUnique({ where: { code: fields.code } });
      if (dup) return badRequest("Affiliate code already exists");
      update.code = String(fields.code).toUpperCase();
    }
    const item = await db.affiliate.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "affiliate", item.id, item.code);
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
    const existing = await db.affiliate.findUnique({ where: { id } });
    if (!existing) return notFound("Affiliate not found");
    await db.affiliate.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "affiliate", id, existing.code);
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
