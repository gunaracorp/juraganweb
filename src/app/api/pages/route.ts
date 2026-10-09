// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const slug = url.searchParams.get("slug");
  const admin = url.searchParams.get("admin") === "true";

  if (slug) {
    const page = await db.page.findUnique({ where: { slug } });
    if (!page) return notFound("Page not found");
    return json({ ok: true, page });
  }

  if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
  }
  const where: Record<string, unknown> = {};
  if (!admin) where.status = "published";

  const items = await db.page.findMany({
    where,
    orderBy: [{ menuOrder: "asc" }, { createdAt: "desc" }],
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.titleId || body.titleEn || "page");
    let finalSlug = slug;
    let i = 1;
    while (await db.page.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const item = await db.page.create({
      data: {
        slug: finalSlug,
        titleId: body.titleId || "",
        titleEn: body.titleEn || body.titleId || "",
        contentId: body.contentId || "",
        contentEn: body.contentEn || body.contentId || "",
        excerptId: body.excerptId || "",
        excerptEn: body.excerptEn || "",
        coverImage: body.coverImage || null,
        template: body.template || "default",
        status: body.status || "published",
        showInMenu: body.showInMenu !== false,
        menuOrder: Number(body.menuOrder) || 0,
        parentId: body.parentId || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        author: body.author || "Admin",
      },
    });
    await logActivity(req, auth.user, "created", "page", item.id, item.titleId);
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
    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) return notFound("Page not found");
    const update: Record<string, unknown> = {};
    for (const k of ["titleId","titleEn","contentId","contentEn","excerptId","excerptEn","coverImage","template","status","parentId","metaTitle","metaDescription","author"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.showInMenu !== undefined) update.showInMenu = !!fields.showInMenu;
    if (fields.menuOrder !== undefined) update.menuOrder = Number(fields.menuOrder);
    if (fields.slug && fields.slug !== existing.slug) {
      let finalSlug = fields.slug;
      let i = 1;
      while (await db.page.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${fields.slug}-${i++}`;
      }
      update.slug = finalSlug;
    }
    const item = await db.page.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "page", item.id, item.titleId);
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
    // Soft delete: set status=trash
    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) return notFound("Page not found");
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";
    if (permanent) {
      await db.page.delete({ where: { id } });
    } else {
      await db.page.update({ where: { id }, data: { status: "trash" } });
    }
    await logActivity(req, auth.user, "deleted", "page", id, existing.titleId);
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
