// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const items = await db.coupon.findMany({
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
    if (!body.code) return badRequest("code required");
    const code = String(body.code).toUpperCase();
    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) return badRequest("Coupon code already exists");
    const item = await db.coupon.create({
      data: {
        code,
        type: body.type || "percent",
        value: Number(body.value) || 0,
        minOrder: Number(body.minOrder) || 0,
        maxDiscount: Number(body.maxDiscount) || 0,
        usageLimit: Number(body.usageLimit) || 0,
        used: 0,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validTo: body.validTo ? new Date(body.validTo) : null,
        status: body.status || "active",
        appliesTo: body.appliesTo || "all",
      },
    });
    await logActivity(req, auth.user, "created", "coupon", item.id, item.code);
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
    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) return notFound("Coupon not found");
    const update: Record<string, unknown> = {};
    for (const k of ["type", "status", "appliesTo"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["value", "minOrder", "maxDiscount", "usageLimit", "used"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.validFrom !== undefined) update.validFrom = fields.validFrom ? new Date(fields.validFrom) : null;
    if (fields.validTo !== undefined) update.validTo = fields.validTo ? new Date(fields.validTo) : null;
    if (fields.code) {
      const code = String(fields.code).toUpperCase();
      if (code !== existing.code) {
        const dup = await db.coupon.findUnique({ where: { code } });
        if (dup) return badRequest("Coupon code already exists");
        update.code = code;
      }
    }
    const item = await db.coupon.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "coupon", item.id, item.code);
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
    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) return notFound("Coupon not found");
    await db.coupon.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "coupon", id, existing.code);
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
