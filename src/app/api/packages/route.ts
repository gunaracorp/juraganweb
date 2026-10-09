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
    const item = await db.servicePackage.findUnique({ where: { slug } });
    if (!item) return notFound("Package not found");
    return json({ ok: true, item: parsePackage(item) });
  }

  if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
  }
  const where: Record<string, unknown> = {};
  if (!admin) where.active = true;
  if (category) where.category = category;
  const items = await db.servicePackage.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return json({ ok: true, items: items.map(parsePackage) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.nameId || body.nameEn || "package");
    let finalSlug = slug;
    let i = 1;
    while (await db.servicePackage.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${i++}`;
    }
    const item = await db.servicePackage.create({
      data: {
        slug: finalSlug,
        nameId: body.nameId || "",
        nameEn: body.nameEn || body.nameId || "",
        descId: body.descId || "",
        descEn: body.descEn || "",
        category: body.category || "hosting",
        price: Number(body.price) || 0,
        priceYearly: Number(body.priceYearly) || 0,
        setupFee: Number(body.setupFee) || 0,
        currency: body.currency || "IDR",
        billingCycle: body.billingCycle || "monthly",
        features: JSON.stringify(body.features || []),
        specs: JSON.stringify(body.specs || {}),
        popular: !!body.popular,
        featured: !!body.featured,
        active: body.active !== false,
        order: Number(body.order) || 0,
        maxOrders: Number(body.maxOrders) || 0,
        stock: Number(body.stock) || 0,
      },
    });
    await logActivity(req, auth.user, "created", "package", item.id, item.nameId);
    return json({ ok: true, item: parsePackage(item) });
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
    const existing = await db.servicePackage.findUnique({ where: { id } });
    if (!existing) return notFound("Package not found");
    const update: Record<string, unknown> = {};
    for (const k of ["nameId", "nameEn", "descId", "descEn", "category", "currency", "billingCycle"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["price", "priceYearly", "setupFee", "order", "maxOrders", "stock"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    for (const k of ["popular", "featured", "active"]) {
      if (fields[k] !== undefined) update[k] = !!fields[k];
    }
    if (fields.features !== undefined) update.features = JSON.stringify(fields.features || []);
    if (fields.specs !== undefined) update.specs = JSON.stringify(fields.specs || {});
    if (fields.slug && fields.slug !== existing.slug) {
      let finalSlug = fields.slug;
      let i = 1;
      while (await db.servicePackage.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${fields.slug}-${i++}`;
      }
      update.slug = finalSlug;
    }
    const item = await db.servicePackage.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "package", item.id, item.nameId);
    return json({ ok: true, item: parsePackage(item) });
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
    const existing = await db.servicePackage.findUnique({ where: { id } });
    if (!existing) return notFound("Package not found");
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";
    if (permanent) {
      await db.servicePackage.delete({ where: { id } });
    } else {
      await db.servicePackage.update({ where: { id }, data: { active: false } });
    }
    await logActivity(req, auth.user, "deleted", "package", id, existing.nameId);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function parsePackage(p: unknown) {
  const item = p as Record<string, unknown>;
  try { item.features = JSON.parse((item.features as string) || "[]"); } catch { item.features = []; }
  try { item.specs = JSON.parse((item.specs as string) || "{}"); } catch { item.specs = {}; }
  return item;
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
