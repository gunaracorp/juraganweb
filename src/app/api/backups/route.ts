// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const type = req.nextUrl.searchParams.get("type");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;
  const items = await db.backup.findMany({
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
    // Create as queued, then simulate completion with mock size after creation
    const item = await db.backup.create({
      data: {
        type: body.type || "full",
        size: 0,
        path: body.path || `/backups/${Date.now()}.tar.gz`,
        status: "queued",
        source: body.source || "manual",
        notes: body.notes || "",
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    // Simulate completion after 2 seconds
    setTimeout(async () => {
      try {
        const mockSize = Math.round((Math.random() * 800 + 200) * 1024 * 1024); // 200MB–1GB
        await db.backup.update({
          where: { id: item.id },
          data: { status: "completed", size: mockSize },
        });
      } catch {}
    }, 2000);
    await logActivity(req, auth.user, "created", "backup", item.id, item.path);
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Create failed" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const action = req.nextUrl.searchParams.get("action");
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return badRequest("id required");
    const existing = await db.backup.findUnique({ where: { id } });
    if (!existing) return notFound("Backup not found");
    const update: Record<string, unknown> = {};
    for (const k of ["type", "status", "source", "notes", "path"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.size !== undefined) update.size = Number(fields.size);
    if (fields.expiresAt !== undefined) update.expiresAt = fields.expiresAt ? new Date(fields.expiresAt) : null;

    if (action === "restore") {
      // Simulate restore: status='running' briefly, then 'completed'
      update.status = "running";
      const item = await db.backup.update({ where: { id }, data: update });
      setTimeout(async () => {
        try { await db.backup.update({ where: { id }, data: { status: "completed" } }); } catch {}
      }, 2000);
      await logActivity(req, auth.user, "restored", "backup", item.id, item.path);
      return json({ ok: true, item });
    }

    const item = await db.backup.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "backup", item.id, item.path);
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
    const existing = await db.backup.findUnique({ where: { id } });
    if (!existing) return notFound("Backup not found");
    await db.backup.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "backup", id, existing.path);
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
