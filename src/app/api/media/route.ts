// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin") === "true";
  if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
  }
  const folder = req.nextUrl.searchParams.get("folder");
  const where: Record<string, unknown> = {};
  if (folder) where.folder = folder;

  const items = await db.media.findMany({
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
    const item = await db.media.create({
      data: {
        filename: body.filename || "untitled",
        url: body.url || "",
        thumbUrl: body.thumbUrl || null,
        mimeType: body.mimeType || "image/jpeg",
        size: Number(body.size) || 0,
        width: body.width ? Number(body.width) : null,
        height: body.height ? Number(body.height) : null,
        alt: body.alt || "",
        caption: body.caption || "",
        uploadedBy: auth.user.username,
        folder: body.folder || "/",
      },
    });
    await logActivity(req, auth.user, "uploaded", "media", item.id, item.filename);
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Upload failed" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return badRequest("id required");
    const update: Record<string, unknown> = {};
    for (const k of ["filename","alt","caption","folder","thumbUrl","url"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    const item = await db.media.update({ where: { id }, data: update });
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
    const existing = await db.media.findUnique({ where: { id } });
    if (!existing) return notFound("Media not found");
    await db.media.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "media", id, existing.filename);
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
