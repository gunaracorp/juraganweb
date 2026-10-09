// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

async function genInvoiceNumber(year: number): Promise<string> {
  const prefix = `INV-${year}-`;
  const orders = await db.order.findMany({ where: { invoice: { startsWith: prefix } } });
  let max = 0;
  for (const o of orders) {
    const seq = parseInt(o.invoice.replace(prefix, ""), 10);
    if (!isNaN(seq) && seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const customerId = req.nextUrl.searchParams.get("customerId");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  const items = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: items.map(parseOrder) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const year = new Date().getFullYear();
    const invoice = await genInvoiceNumber(year);
    const item = await db.order.create({
      data: {
        invoice,
        customerId: body.customerId || "",
        customerName: body.customerName || "",
        customerEmail: body.customerEmail || "",
        items: JSON.stringify(body.items || []),
        subtotal: Number(body.subtotal) || 0,
        discount: Number(body.discount) || 0,
        tax: Number(body.tax) || 0,
        total: Number(body.total) || 0,
        couponCode: body.couponCode || null,
        paymentMethod: body.paymentMethod || null,
        paymentStatus: body.paymentStatus || "pending",
        status: body.status || "pending",
        notes: body.notes || "",
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
      },
    });
    await logActivity(req, auth.user, "created", "order", item.id, item.invoice);
    return json({ ok: true, item: parseOrder(item) });
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
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) return notFound("Order not found");
    const update: Record<string, unknown> = {};
    for (const k of ["customerId", "customerName", "customerEmail", "couponCode", "paymentMethod", "paymentStatus", "status", "notes"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["subtotal", "discount", "tax", "total"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.items !== undefined) update.items = JSON.stringify(fields.items || []);
    if (fields.paidAt !== undefined) update.paidAt = fields.paidAt ? new Date(fields.paidAt) : null;
    if (fields.paymentStatus === "paid" && !existing.paidAt) update.paidAt = new Date();
    const item = await db.order.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "order", item.id, item.invoice);
    return json({ ok: true, item: parseOrder(item) });
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
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) return notFound("Order not found");
    await db.order.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "order", id, existing.invoice);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function parseOrder(o: unknown) {
  const item = o as Record<string, unknown>;
  try { item.items = JSON.parse((item.items as string) || "[]"); } catch { item.items = []; }
  return item;
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
