// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

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
  const category = url.searchParams.get("category");

  if (slug) {
    const item = await db.knowledgeArticle.findUnique({ where: { slug } });
    if (!item) return notFound("Article not found");
    // Increment views (public)
    if (!admin) {
      try { await db.knowledgeArticle.update({ where: { id: item.id }, data: { views: { increment: 1 } } }); } catch {}
      item.views += 1;
    }
    return json({ ok: true, item });
  }

  if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
  }
  const where: Record<string, unknown> = {};
  if (!admin) where.published = true;
  if (category) where.category = category;
  const items = await db.knowledgeArticle.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.titleId || body.titleEn || "article");
    let finalSlug = slug;
    let i = 1;
    while (await db.knowledgeArticle.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const item = await db.knowledgeArticle.create({
      data: {
        slug: finalSlug,
        titleId: body.titleId || "",
        titleEn: body.titleEn || body.titleId || "",
        contentId: body.contentId || "",
        contentEn: body.contentEn || body.contentId || "",
        excerptId: body.excerptId || "",
        excerptEn: body.excerptEn || "",
        category: body.category || "general",
        tags: body.tags || "",
        published: body.published !== false,
        featured: !!body.featured,
        author: body.author || "Admin",
      },
    });
    await logActivity(req, auth.user, "created", "knowledge", item.id, item.titleId);
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
    const existing = await db.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) return notFound("Article not found");
    const update: Record<string, unknown> = {};
    for (const k of ["titleId", "titleEn", "contentId", "contentEn", "excerptId", "excerptEn", "category", "tags", "author"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["published", "featured"]) {
      if (fields[k] !== undefined) update[k] = !!fields[k];
    }
    if (fields.helpful !== undefined) update.helpful = Number(fields.helpful);
    if (fields.unhelpful !== undefined) update.unhelpful = Number(fields.unhelpful);
    if (fields.views !== undefined) update.views = Number(fields.views);
    if (fields.slug && fields.slug !== existing.slug) {
      let finalSlug = fields.slug;
      let i = 1;
      while (await db.knowledgeArticle.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${fields.slug}-${i++}`;
      }
      update.slug = finalSlug;
    }
    const item = await db.knowledgeArticle.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "knowledge", item.id, item.titleId);
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
    const existing = await db.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) return notFound("Article not found");
    await db.knowledgeArticle.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "knowledge", id, existing.titleId);
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
