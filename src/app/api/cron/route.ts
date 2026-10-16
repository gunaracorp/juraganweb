// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const enabled = req.nextUrl.searchParams.get("enabled");
  const where: Record<string, unknown> = {};
  if (enabled !== null && enabled !== undefined) where.enabled = enabled === "true";
  const items = await db.cronJob.findMany({
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
    if (!body.command) return badRequest("command required");
    if (!body.schedule) return badRequest("schedule required");
    const item = await db.cronJob.create({
      data: {
        name: body.name,
        command: body.command,
        schedule: body.schedule,
        description: body.description || "",
        enabled: body.enabled !== false,
        nextRun: body.nextRun ? new Date(body.nextRun) : null,
      },
    });
    await logActivity(req, auth.user, "created", "cron", item.id, item.name);
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
    const existing = await db.cronJob.findUnique({ where: { id } });
    if (!existing) return notFound("Cron job not found");
    const update: Record<string, unknown> = {};
    for (const k of ["name", "command", "schedule", "description", "lastStatus", "lastOutput"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.enabled !== undefined) update.enabled = !!fields.enabled;
    if (fields.lastRun !== undefined) update.lastRun = fields.lastRun ? new Date(fields.lastRun) : null;
    if (fields.nextRun !== undefined) update.nextRun = fields.nextRun ? new Date(fields.nextRun) : null;
    const item = await db.cronJob.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "cron", item.id, item.name);
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
    const existing = await db.cronJob.findUnique({ where: { id } });
    if (!existing) return notFound("Cron job not found");
    await db.cronJob.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "cron", id, existing.name);
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
