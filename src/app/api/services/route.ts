// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET() {
  const items = await db.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.titleId || body.titleEn || "service");
    let finalSlug = slug;
    let i = 1;
    while (await db.service.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const item = await db.service.create({
      data: {
        slug: finalSlug,
        titleId: body.titleId || "",
        titleEn: body.titleEn || body.titleId || "",
        descId: body.descId || "",
        descEn: body.descEn || body.descId || "",
        icon: body.icon || "Code",
        price: Number(body.price) || 0,
        priceLabel: body.priceLabel || "",
        features: body.features || "",
        active: body.active !== false,
        order: Number(body.order) || 0,
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
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return notFound("Service not found");
    const update: Record<string, unknown> = {};
    for (const k of ["titleId", "titleEn", "descId", "descEn", "icon", "priceLabel", "features"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.price !== undefined) update.price = Number(fields.price);
    if (fields.order !== undefined) update.order = Number(fields.order);
    if (fields.active !== undefined) update.active = !!fields.active;
    if (fields.slug && fields.slug !== existing.slug) {
      let finalSlug = fields.slug;
      let i = 1;
      while (await db.service.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${fields.slug}-${i++}`;
      }
      update.slug = finalSlug;
    }
    const item = await db.service.update({ where: { id }, data: update });
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
    await db.service.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
