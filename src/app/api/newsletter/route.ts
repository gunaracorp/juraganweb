// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const items = await db.newsletterCampaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: items.map(parseCampaign) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) return badRequest("name required");
    const item = await db.newsletterCampaign.create({
      data: {
        name: body.name,
        subjectId: body.subjectId || body.name,
        subjectEn: body.subjectEn || body.subjectId || body.name,
        contentId: body.contentId || "",
        contentEn: body.contentEn || body.contentId || "",
        stats: JSON.stringify({ sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }),
        status: body.status || "draft",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        target: body.target || "all",
        targetCount: Number(body.targetCount) || 0,
        createdBy: auth.user.username,
      },
    });
    await logActivity(req, auth.user, "created", "newsletter", item.id, item.name);
    return json({ ok: true, item: parseCampaign(item) });
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
    const existing = await db.newsletterCampaign.findUnique({ where: { id } });
    if (!existing) return notFound("Campaign not found");
    const update: Record<string, unknown> = {};
    for (const k of ["name", "subjectId", "subjectEn", "contentId", "contentEn", "status", "target", "createdBy"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    for (const k of ["targetCount"]) {
      if (fields[k] !== undefined) update[k] = Number(fields[k]);
    }
    if (fields.scheduledAt !== undefined) update.scheduledAt = fields.scheduledAt ? new Date(fields.scheduledAt) : null;
    if (fields.stats !== undefined) update.stats = JSON.stringify(fields.stats || {});

    if (action === "send") {
      // Mock send: set sentAt + stats with mock numbers
      const mockSent = existing.targetCount || Math.round(Math.random() * 1000 + 200);
      const stats = {
        sent: mockSent,
        delivered: Math.round(mockSent * 0.98),
        opened: Math.round(mockSent * 0.45),
        clicked: Math.round(mockSent * 0.18),
        bounced: Math.round(mockSent * 0.02),
        unsubscribed: Math.round(mockSent * 0.01),
      };
      update.status = "sent";
      update.sentAt = new Date();
      update.stats = JSON.stringify(stats);
      update.targetCount = mockSent;
    }

    const item = await db.newsletterCampaign.update({ where: { id }, data: update });
    await logActivity(req, auth.user, action === "send" ? "sent" : "updated", "newsletter", item.id, item.name);
    return json({ ok: true, item: parseCampaign(item) });
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
    const existing = await db.newsletterCampaign.findUnique({ where: { id } });
    if (!existing) return notFound("Campaign not found");
    await db.newsletterCampaign.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "newsletter", id, existing.name);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function parseCampaign(c: unknown) {
  const item = c as Record<string, unknown>;
  try { item.stats = JSON.parse((item.stats as string) || "{}"); } catch { item.stats = {}; }
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
