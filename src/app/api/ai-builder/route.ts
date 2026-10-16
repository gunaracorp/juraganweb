// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function randId() {
  return "c" + Math.random().toString(36).slice(2, 14);
}

function mockPages(business: string, industry: string): any[] {
  const safe = (business || "Business").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  return [
    { id: randId(), slug: "", title: `${business} — Home`, path: "/" },
    { id: randId(), slug: "about", title: `About ${business}`, path: "/about" },
    { id: randId(), slug: `services-${industry}`, title: `${industry} Services`, path: "/services" },
    { id: randId(), slug: "pricing", title: `Pricing Plans`, path: "/pricing" },
    { id: randId(), slug: "blog", title: `${business} Blog`, path: "/blog" },
    { id: randId(), slug: "contact", title: `Contact ${business}`, path: "/contact" },
  ].map((p) => ({ ...p, slug: p.slug || safe }));
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const items = await db.aIWebsiteProject.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: items.map(parseProject) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) return badRequest("name required");
    const item = await db.aIWebsiteProject.create({
      data: {
        name: body.name,
        business: body.business || "",
        industry: body.industry || "",
        template: body.template || "modern",
        pages: JSON.stringify(body.pages || []),
        status: body.status || "draft",
        publishedUrl: body.publishedUrl || null,
        createdBy: auth.user.username,
      },
    });
    await logActivity(req, auth.user, "created", "ai-builder", item.id, item.name);
    return json({ ok: true, item: parseProject(item) });
  } catch (e) {
    return json({ ok: false, error: "Create failed" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const action = req.nextUrl.searchParams.get("action");
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return badRequest("id required");
    const existing = await db.aIWebsiteProject.findUnique({ where: { id } });
    if (!existing) return notFound("AI project not found");
    const update: Record<string, unknown> = {};
    for (const k of ["name", "business", "industry", "template", "status", "publishedUrl"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.pages !== undefined) update.pages = JSON.stringify(fields.pages || []);

    if (action === "generate") {
      // Simulate AI generation: status='generating' → 'completed' after 2s, mock pages
      update.status = "generating";
      const item = await db.aIWebsiteProject.update({ where: { id }, data: update });
      setTimeout(async () => {
        try {
          await db.aIWebsiteProject.update({
            where: { id },
            data: {
              status: "completed",
              pages: JSON.stringify(mockPages(String(existing.business), String(existing.industry))),
            },
          });
        } catch {}
      }, 2000);
      await logActivity(req, auth.user, "generated", "ai-builder", item.id, item.name);
      return json({ ok: true, item });
    }

    if (action === "publish") {
      // Set publishedUrl + status='published'
      const pubUrl = fields.publishedUrl || `https://${String(existing.business || "site").toLowerCase().replace(/[^a-z0-9]/g, "")}.juragan.site`;
      update.status = "published";
      update.publishedUrl = pubUrl;
      const item = await db.aIWebsiteProject.update({ where: { id }, data: update });
      await logActivity(req, auth.user, "published", "ai-builder", item.id, item.name);
      return json({ ok: true, item: parseProject(item) });
    }

    const item = await db.aIWebsiteProject.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "ai-builder", item.id, item.name);
    return json({ ok: true, item: parseProject(item) });
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
    const existing = await db.aIWebsiteProject.findUnique({ where: { id } });
    if (!existing) return notFound("AI project not found");
    await db.aIWebsiteProject.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "ai-builder", id, existing.name);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function parseProject(p: unknown) {
  const item = p as Record<string, unknown>;
  try { item.pages = JSON.parse((item.pages as string) || "[]"); } catch { item.pages = []; }
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
