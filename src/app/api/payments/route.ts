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
  const items = await db.payment.findMany({
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
    const item = await db.payment.create({
      data: {
        invoiceId: body.invoiceId || null,
        orderId: body.orderId || null,
        customerId: body.customerId || "",
        amount: Number(body.amount) || 0,
        currency: body.currency || "IDR",
        method: body.method || "bank_transfer",
        gateway: body.gateway || null,
        gatewayRef: body.gatewayRef || null,
        status: body.status || "pending",
        fee: Number(body.fee) || 0,
        notes: body.notes || "",
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
      },
    });
    await logActivity(req, auth.user, "created", "payment", item.id, `#${item.id.slice(-6)}`);
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
    const existing = await db.payment.findUnique({ where: { id } });
    if (!existing) return notFound("Payment not found");
    const update: Record<string, unknown> = {};
    for (const k of ["invoiceId", "orderId", "customerId", "currency", "method", "gateway", "gatewayRef", "status", "notes"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["amount", "fee"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.paidAt !== undefined) update.paidAt = fields.paidAt ? new Date(fields.paidAt) : null;
    if (fields.status === "success" && !existing.paidAt) update.paidAt = new Date();
    const item = await db.payment.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "payment", item.id, `#${item.id.slice(-6)}`);
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
    const existing = await db.payment.findUnique({ where: { id } });
    if (!existing) return notFound("Payment not found");
    await db.payment.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "payment", id, `#${id.slice(-6)}`);
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
