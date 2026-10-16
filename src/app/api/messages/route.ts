// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, requireAuth } from "@/lib/api-utils";

// Public POST - create new message from contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body || {};
    if (!name || !email || !subject || !message) {
      return badRequest("Missing required fields");
    }
    const item = await db.message.create({
      data: {
        name: String(name),
        email: String(email),
        phone: phone ? String(phone) : null,
        subject: String(subject),
        message: String(message),
        status: "new",
        read: false,
        replied: false,
      },
    });
    return json({ ok: true, id: item.id });
  } catch {
    return json({ ok: false, error: "Failed to send message" }, 500);
  }
}

// Admin GET - list all messages
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const items = await db.message.findMany({ orderBy: { createdAt: "desc" } });
  return json({ ok: true, items });
}

// Admin PUT - update message (read/status)
export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const { id, read, status, replied } = body || {};
    if (!id) return badRequest("id required");
    const update: Record<string, unknown> = {};
    if (read !== undefined) update.read = !!read;
    if (status !== undefined) update.status = String(status);
    if (replied !== undefined) update.replied = !!replied;
    const item = await db.message.update({ where: { id }, data: update });
    return json({ ok: true, item });
  } catch {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}

// Admin DELETE
export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return badRequest("id required");
  try {
    await db.message.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}
