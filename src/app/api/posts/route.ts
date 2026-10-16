// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getToken, json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function sanitizeTags(tags?: string) {
  if (!tags) return "";
  return tags;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const slug = url.searchParams.get("slug");
  const publishedOnly = url.searchParams.get("published") === "true";
  const admin = url.searchParams.get("admin") === "true";

  if (slug) {
    const post = await db.post.findUnique({ where: { slug } });
    if (!post) return notFound("Post not found");
    if (publishedOnly && !post.published && !admin) return notFound("Post not found");
    return json({ ok: true, post });
  }

  const where: Record<string, unknown> = {};
  if (publishedOnly) where.published = true;
  else if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
  }

  const posts = await db.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, posts });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.titleId || body.titleEn || "post");
    // ensure unique slug
    let finalSlug = slug;
    let i = 1;
    while (await db.post.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const post = await db.post.create({
      data: {
        slug: finalSlug,
        titleId: body.titleId || "",
        titleEn: body.titleEn || body.titleId || "",
        excerptId: body.excerptId || "",
        excerptEn: body.excerptEn || body.excerptId || "",
        contentId: body.contentId || "",
        contentEn: body.contentEn || body.contentId || "",
        category: body.category || "Umum",
        tags: sanitizeTags(body.tags),
        coverImage: body.coverImage || null,
        author: body.author || "Tim JuraganWebsite",
        featured: !!body.featured,
        published: body.published !== false,
      },
    });
    return json({ ok: true, post });
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
    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return notFound("Post not found");
    const update: Record<string, unknown> = {};
    for (const k of ["titleId", "titleEn", "excerptId", "excerptEn", "contentId", "contentEn", "category", "tags", "coverImage", "author"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.featured !== undefined) update.featured = !!fields.featured;
    if (fields.published !== undefined) update.published = !!fields.published;
    if (fields.slug && fields.slug !== existing.slug) {
      let finalSlug = fields.slug;
      let i = 1;
      while (await db.post.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${fields.slug}-${i++}`;
      }
      update.slug = finalSlug;
    }
    const post = await db.post.update({ where: { id }, data: update });
    return json({ ok: true, post });
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
    await db.post.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// silence unused warning
void getToken;
