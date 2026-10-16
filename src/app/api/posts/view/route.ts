// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = body || {};
    if (!slug) return json({ ok: false, error: "slug required" }, 400);
    await db.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    }).catch(() => {});
    return json({ ok: true });
  } catch {
    return json({ ok: false }, 500);
  }
}
