// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, unauthorized, requireAuth } from "@/lib/api-utils";

function rand(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

async function ensureMockData() {
  const count = await db.visitorStat.count();
  if (count > 0) return;
  // Generate last 30 days of mock stats
  const rows = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const visitors = rand(50, 200);
    rows.push({
      date: dateStr,
      visitors,
      pageViews: Math.round(visitors * (1.5 + Math.random())),
      uniqueIPs: Math.round(visitors * 0.85),
      bounceRate: Math.round((Math.random() * 30 + 30) * 100) / 100,
      avgTime: rand(60, 240),
      topReferrer: ["google.com", "facebook.com", "instagram.com", "direct", "bing.com"][Math.floor(Math.random() * 5)],
      topCountry: "Indonesia",
      topDevice: Math.random() > 0.4 ? "Mobile" : "Desktop",
    });
  }
  await db.visitorStat.createMany({ data: rows });
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  await ensureMockData();
  const items = await db.visitorStat.findMany({
    orderBy: { date: "asc" },
    take: 60,
  });
  const stats = computeStats(items);
  return json({ ok: true, items, stats });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const dateStr = body.date || new Date().toISOString().slice(0, 10);
    // Upsert by date
    const existing = await db.visitorStat.findFirst({ where: { date: dateStr } });
    if (existing) {
      const item = await db.visitorStat.update({
        where: { id: existing.id },
        data: {
          visitors: existing.visitors + (Number(body.visitors) || 0),
          pageViews: existing.pageViews + (Number(body.pageViews) || 0),
          uniqueIPs: existing.uniqueIPs + (Number(body.uniqueIPs) || 0),
        },
      });
      return json({ ok: true, item });
    }
    const item = await db.visitorStat.create({
      data: {
        date: dateStr,
        visitors: Number(body.visitors) || 0,
        pageViews: Number(body.pageViews) || 0,
        uniqueIPs: Number(body.uniqueIPs) || 0,
        bounceRate: Number(body.bounceRate) || 0,
        avgTime: Number(body.avgTime) || 0,
        topReferrer: body.topReferrer || null,
        topCountry: body.topCountry || null,
        topDevice: body.topDevice || null,
      },
    });
    return json({ ok: true, item });
  } catch (e) {
    return json({ ok: false, error: "Create failed" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const r = await db.visitorStat.deleteMany({ where: { createdAt: { lt: cutoff } } });
    return json({ ok: true, deleted: r.count });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function computeStats(items: any[]) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const sumRange = (from: string) => {
    const filtered = items.filter((i) => i.date >= from);
    return {
      visitors: filtered.reduce((s, i) => s + i.visitors, 0),
      pageViews: filtered.reduce((s, i) => s + i.pageViews, 0),
      uniqueIPs: filtered.reduce((s, i) => s + i.uniqueIPs, 0),
      bounceRate: filtered.length
        ? Math.round((filtered.reduce((s, i) => s + i.bounceRate, 0) / filtered.length) * 100) / 100
        : 0,
      avgTime: filtered.length
        ? Math.round(filtered.reduce((s, i) => s + i.avgTime, 0) / filtered.length)
        : 0,
    };
  };
  return {
    today: sumRange(today),
    week: sumRange(weekAgo),
    month: sumRange(monthAgo),
    total: {
      visitors: items.reduce((s, i) => s + i.visitors, 0),
      pageViews: items.reduce((s, i) => s + i.pageViews, 0),
    },
  };
}
