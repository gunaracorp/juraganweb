// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET() {
  const items = await db.menu.findMany({ orderBy: { createdAt: "desc" } });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.name || "menu");
    let finalSlug = slug;
    let i = 1;
    while (await db.menu.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const item = await db.menu.create({
      data: {
        slug: finalSlug,
        name: body.name || "Menu",
        location: body.location || "header",
        items: typeof body.items === "string" ? body.items : JSON.stringify(body.items || []),
      },
    });
    await logActivity(req, auth.user, "created", "menu", item.id, item.name);
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
    const update: Record<string, unknown> = {};
    for (const k of ["name","location","slug"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.items !== undefined) update.items = typeof fields.items === "string" ? fields.items : JSON.stringify(fields.items);
    const item = await db.menu.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "menu", item.id, item.name);
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
    const existing = await db.menu.findUnique({ where: { id } });
    if (!existing) return notFound("Menu not found");
    await db.menu.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "menu", id, existing.name);
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
