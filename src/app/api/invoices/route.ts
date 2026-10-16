// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

async function genInvoiceNumber(year: number): Promise<string> {
  const prefix = `INV-${year}-`;
  const invs = await db.invoice.findMany({ where: { number: { startsWith: prefix } } });
  let max = 0;
  for (const i of invs) {
    const seq = parseInt(i.number.replace(prefix, ""), 10);
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
  const items = await db.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: items.map(parseInvoice) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const year = new Date().getFullYear();
    const number = body.number || (await genInvoiceNumber(year));
    const item = await db.invoice.create({
      data: {
        number,
        orderId: body.orderId || null,
        customerId: body.customerId || "",
        customerName: body.customerName || "",
        customerEmail: body.customerEmail || "",
        items: JSON.stringify(body.items || []),
        subtotal: Number(body.subtotal) || 0,
        discount: Number(body.discount) || 0,
        tax: Number(body.tax) || 0,
        total: Number(body.total) || 0,
        currency: body.currency || "IDR",
        status: body.status || "unpaid",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        sentAt: body.sentAt ? new Date(body.sentAt) : null,
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
        notes: body.notes || "",
      },
    });
    await logActivity(req, auth.user, "created", "invoice", item.id, item.number);
    return json({ ok: true, item: parseInvoice(item) });
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
    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) return notFound("Invoice not found");
    const update: Record<string, unknown> = {};
    for (const k of ["orderId", "customerId", "customerName", "customerEmail", "currency", "status", "notes"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["subtotal", "discount", "tax", "total"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.items !== undefined) update.items = JSON.stringify(fields.items || []);
    if (fields.dueDate !== undefined) update.dueDate = fields.dueDate ? new Date(fields.dueDate) : null;
    if (fields.sentAt !== undefined) update.sentAt = fields.sentAt ? new Date(fields.sentAt) : null;
    // markPaid / markUnpaid action
    if (fields.markPaid === true || fields.status === "paid") {
      update.status = "paid";
      update.paidAt = new Date();
    } else if (fields.markUnpaid === true || fields.status === "unpaid") {
      update.status = "unpaid";
      update.paidAt = null;
    }
    const item = await db.invoice.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "invoice", item.id, item.number);
    return json({ ok: true, item: parseInvoice(item) });
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
    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) return notFound("Invoice not found");
    await db.invoice.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "invoice", id, existing.number);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function parseInvoice(i: unknown) {
  const item = i as Record<string, unknown>;
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
