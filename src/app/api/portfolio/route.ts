// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET() {
  const items = await db.portfolio.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.titleId || body.titleEn || "portfolio");
    let finalSlug = slug;
    let i = 1;
    while (await db.portfolio.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const item = await db.portfolio.create({
      data: {
        slug: finalSlug,
        titleId: body.titleId || "",
        titleEn: body.titleEn || body.titleId || "",
        descId: body.descId || "",
        descEn: body.descEn || body.descId || "",
        category: body.category || "Website",
        client: body.client || "",
        url: body.url || null,
        image: body.image || null,
        year: Number(body.year) || new Date().getFullYear(),
        featured: !!body.featured,
      },
    });
    return json({ ok: true, item });
  } catch {
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
    const existing = await db.portfolio.findUnique({ where: { id } });
    if (!existing) return notFound("Portfolio not found");
    const update: Record<string, unknown> = {};
    for (const k of ["titleId", "titleEn", "descId", "descEn", "category", "client", "url", "image"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.year !== undefined) update.year = Number(fields.year);
    if (fields.featured !== undefined) update.featured = !!fields.featured;
    if (fields.slug && fields.slug !== existing.slug) {
      let finalSlug = fields.slug;
      let i = 1;
      while (await db.portfolio.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${fields.slug}-${i++}`;
      }
      update.slug = finalSlug;
    }
    const item = await db.portfolio.update({ where: { id }, data: update });
    return json({ ok: true, item });
  } catch {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return badRequest("id required");
  try {
    await db.portfolio.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
