// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

export async function GET() {
  const items = await db.testimonial.findMany({
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
    const item = await db.testimonial.create({
      data: {
        name: body.name || "",
        company: body.company || "",
        role: body.role || "",
        messageId: body.messageId || "",
        messageEn: body.messageEn || body.messageId || "",
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        avatar: body.avatar || null,
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
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return notFound("Testimonial not found");
    const update: Record<string, unknown> = {};
    for (const k of ["name", "company", "role", "messageId", "messageEn", "avatar"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.rating !== undefined) update.rating = Math.min(5, Math.max(1, Number(fields.rating)));
    if (fields.order !== undefined) update.order = Number(fields.order);
    if (fields.active !== undefined) update.active = !!fields.active;
    const item = await db.testimonial.update({ where: { id }, data: update });
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
    await db.testimonial.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}
