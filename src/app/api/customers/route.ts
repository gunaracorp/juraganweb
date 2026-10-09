// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { company: { contains: q } },
    ];
  }
  const items = await db.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: items.map(safeCustomer) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.email) return badRequest("email required");
    const existing = await db.customer.findUnique({ where: { email: body.email } });
    if (existing) return badRequest("Email already exists");
    const item = await db.customer.create({
      data: {
        email: body.email,
        name: body.name || "",
        phone: body.phone || null,
        company: body.company || null,
        address: body.address || null,
        city: body.city || null,
        country: body.country || "Indonesia",
        password: hashPassword(body.password || "changeme123"),
        status: body.status || "active",
        verified: !!body.verified,
        notes: body.notes || "",
      },
    });
    await logActivity(req, auth.user, "created", "customer", item.id, item.name);
    return json({ ok: true, item: safeCustomer(item) });
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
    const existing = await db.customer.findUnique({ where: { id } });
    if (!existing) return notFound("Customer not found");
    const update: Record<string, unknown> = {};
    for (const k of ["email", "name", "phone", "company", "address", "city", "country", "status", "notes"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.verified !== undefined) update.verified = !!fields.verified;
    if (fields.password) update.password = hashPassword(fields.password);
    if (fields.email && fields.email !== existing.email) {
      const dup = await db.customer.findUnique({ where: { email: fields.email } });
      if (dup) return badRequest("Email already exists");
    }
    const item = await db.customer.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "customer", item.id, item.name);
    return json({ ok: true, item: safeCustomer(item) });
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
    const existing = await db.customer.findUnique({ where: { id } });
    if (!existing) return notFound("Customer not found");
    await db.customer.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "customer", id, existing.name);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function safeCustomer(c: unknown) {
  const item = c as Record<string, unknown>;
  delete item.password;
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
