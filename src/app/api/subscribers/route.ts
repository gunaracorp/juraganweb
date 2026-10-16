// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return badRequest("Valid email required");
    }
    const existing = await db.subscriber.findUnique({ where: { email } });
    if (existing) {
      if (!existing.active) {
        await db.subscriber.update({ where: { email }, data: { active: true, name: name || existing.name } });
      }
      return json({ ok: true, message: "Already subscribed" });
    }
    await db.subscriber.create({ data: { email, name: name || null, active: true } });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Failed to subscribe" }, 500);
  }
}

export async function GET() {
  return json({ ok: true, message: "POST to subscribe" });
}
