export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, notFound } from "@/lib/api-utils";

function parse(c: unknown) {
  const item = c as Record<string, unknown>;
  try { item.pros = JSON.parse((item.pros as string) || "[]"); } catch { item.pros = []; }
  try { item.cons = JSON.parse((item.cons as string) || "[]"); } catch { item.cons = []; }
  try { item.features = JSON.parse((item.features as string) || "[]"); } catch { item.features = []; }
  return item;
}

// GET /api/competitors?region=global|indonesia|all  (default all)
// GET /api/competitors?slug=<slug>  (single)
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const slug = url.searchParams.get("slug");
  const region = url.searchParams.get("region") || "all";

  if (slug) {
    const item = await db.competitor.findUnique({ where: { slug } });
    if (!item) return notFound("Provider not found");
    return json({ ok: true, item: parse(item) });
  }

  const where: Record<string, unknown> = { active: true };
  if (region !== "all") where.region = region;

  const items = await db.competitor.findMany({
    where,
    orderBy: [{ region: "asc" }, { order: "asc" }, { rating: "desc" }],
  });
  return json({ ok: true, items: items.map(parse) });
}
