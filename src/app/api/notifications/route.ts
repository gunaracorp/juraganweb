// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const onlyUnread = req.nextUrl.searchParams.get("read") === "false";
  const type = req.nextUrl.searchParams.get("type");
  const where: Record<string, unknown> = { userId: auth.user.username };
  if (onlyUnread) where.read = false;
  if (type) where.type = type;
  const items = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.title) return badRequest("title required");
    const item = await db.notification.create({
      data: {
        userId: body.userId || auth.user.username,
        type: body.type || "system",
        title: body.title,
        message: body.message || "",
        icon: body.icon || "Bell",
        read: !!body.read,
        link: body.link || null,
      },
    });
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Create failed" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  const action = req.nextUrl.searchParams.get("action");
  try {
    if (action === "readall") {
      const r = await db.notification.updateMany({
        where: { userId: auth.user.username, read: false },
        data: { read: true },
      });
      return json({ ok: true, updated: r.count });
    }
    if (!id) return badRequest("id required");
    const existing = await db.notification.findUnique({ where: { id } });
    if (!existing) return notFound("Notification not found");
    if (action === "read") {
      const item = await db.notification.update({ where: { id }, data: { read: true } });
      return json({ ok: true, item });
    }
    if (action === "unread") {
      const item = await db.notification.update({ where: { id }, data: { read: false } });
      return json({ ok: true, item });
    }
    // Generic update
    const body = await req.json();
    const update: Record<string, unknown> = {};
    for (const k of ["type", "title", "message", "icon", "link"]) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    if (body.read !== undefined) update.read = !!body.read;
    const item = await db.notification.update({ where: { id }, data: update });
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  const all = req.nextUrl.searchParams.get("all") === "true";
  try {
    if (all) {
      const r = await db.notification.deleteMany({ where: { userId: auth.user.username } });
      return json({ ok: true, deleted: r.count });
    }
    if (!id) return badRequest("id required");
    const existing = await db.notification.findUnique({ where: { id } });
    if (!existing) return notFound("Notification not found");
    await db.notification.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}
