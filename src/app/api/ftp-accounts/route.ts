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
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const items = await db.fTPAccount.findMany({
    where,
    orderBy: { username: "asc" },
  });
  return json({ ok: true, items: items.map(safeFtp) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.username) return badRequest("username required");
    const item = await db.fTPAccount.create({
      data: {
        username: body.username,
        password: hashPassword(body.password || "changeme123"),
        path: body.path || "/",
        quota: Number(body.quota) || 0,
        status: body.status || "active",
      },
    });
    await logActivity(req, auth.user, "created", "ftp-account", item.id, item.username);
    return json({ ok: true, item: safeFtp(item) });
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
    const existing = await db.fTPAccount.findUnique({ where: { id } });
    if (!existing) return notFound("FTP account not found");
    const update: Record<string, unknown> = {};
    for (const k of ["username", "path", "status"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["quota", "usedQuota"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.password) update.password = hashPassword(fields.password);
    const item = await db.fTPAccount.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "ftp-account", item.id, item.username);
    return json({ ok: true, item: safeFtp(item) });
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
    const existing = await db.fTPAccount.findUnique({ where: { id } });
    if (!existing) return notFound("FTP account not found");
    await db.fTPAccount.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "ftp-account", id, existing.username);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function safeFtp(f: unknown) {
  const item = f as Record<string, unknown>;
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
