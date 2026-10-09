// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const domain = req.nextUrl.searchParams.get("domain");
  const where: Record<string, unknown> = {};
  if (domain) where.domain = domain;
  const items = await db.emailAccount.findMany({
    where,
    orderBy: { email: "asc" },
  });
  return json({ ok: true, items: items.map(safeEmail) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.email) return badRequest("email required");
    if (!body.domain) return badRequest("domain required");
    const existing = await db.emailAccount.findUnique({ where: { email: body.email } });
    if (existing) return badRequest("Email already exists");
    const item = await db.emailAccount.create({
      data: {
        email: body.email,
        domain: body.domain,
        password: hashPassword(body.password || "changeme123"),
        quota: Number(body.quota) || 1024,
        forwardTo: body.forwardTo || null,
        autoReply: body.autoReply || null,
        status: body.status || "active",
      },
    });
    await logActivity(req, auth.user, "created", "email-account", item.id, item.email);
    return json({ ok: true, item: safeEmail(item) });
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
    const existing = await db.emailAccount.findUnique({ where: { id } });
    if (!existing) return notFound("Email account not found");
    const update: Record<string, unknown> = {};
    for (const k of ["domain", "forwardTo", "autoReply", "status"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["quota", "usedQuota"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.password) update.password = hashPassword(fields.password);
    if (fields.email && fields.email !== existing.email) {
      const dup = await db.emailAccount.findUnique({ where: { email: fields.email } });
      if (dup) return badRequest("Email already exists");
      update.email = fields.email;
    }
    if (fields.lastAccess !== undefined) update.lastAccess = fields.lastAccess ? new Date(fields.lastAccess) : null;
    const item = await db.emailAccount.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "email-account", item.id, item.email);
    return json({ ok: true, item: safeEmail(item) });
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
    const existing = await db.emailAccount.findUnique({ where: { id } });
    if (!existing) return notFound("Email account not found");
    await db.emailAccount.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "email-account", id, existing.email);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function safeEmail(e: unknown) {
  const item = e as Record<string, unknown>;
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
