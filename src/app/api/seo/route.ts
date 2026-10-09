// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, unauthorized, requireAuth } from "@/lib/api-utils";

const SEO_KEYS = [
  "seoMetaTitle", "seoMetaDescription", "seoMetaKeywords",
  "seoOgTitle", "seoOgDescription", "seoOgImage",
  "seoTwitterCard", "seoGoogleAnalytics", "seoGoogleSearchConsole",
  "seoBingWebmaster", "seoRobotsTxt", "seoSitemap", "seoStructuredData",
] as const;

export async function GET() {
  const rows = await db.setting.findMany({
    where: { key: { startsWith: "seo" } },
  });
  const settings: Record<string, { valueId: string; valueEn: string }> = {};
  for (const r of rows) {
    settings[r.key] = { valueId: r.valueId, valueEn: r.valueEn };
  }
  // Ensure all keys present
  for (const k of SEO_KEYS) {
    if (!settings[k]) settings[k] = { valueId: "", valueEn: "" };
  }
  return json({ ok: true, settings });
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const settings = body.settings || {};
    for (const [key, val] of Object.entries(settings)) {
      if (!key.startsWith("seo")) continue;
      const v = val as { valueId?: string; valueEn?: string };
      const valueId = v.valueId ?? "";
      const valueEn = v.valueEn ?? valueId;
      await db.setting.upsert({
        where: { key },
        update: { valueId, valueEn },
        create: { key, valueId, valueEn },
      });
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}
