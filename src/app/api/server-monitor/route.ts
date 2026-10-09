// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, requireAuth } from "@/lib/api-utils";

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function ensureMockData() {
  const count = await db.serverMetric.count();
  if (count > 0) return;
  // Generate last 24h of mock metrics (every 5 min = 288 rows)
  const now = Date.now();
  const rows = [];
  for (let i = 287; i >= 0; i--) {
    const t = new Date(now - i * 5 * 60 * 1000);
    rows.push({
      server: "main",
      cpuUsage: rand(20, 60),
      ramUsage: rand(40, 70),
      diskUsage: rand(50, 80),
      bandwidthIn: Math.round(rand(1_000_000, 50_000_000)),
      bandwidthOut: Math.round(rand(500_000, 20_000_000)),
      uptime: Math.round((now - t.getTime()) / 1000),
      loadAvg: `${rand(0.1, 2).toFixed(2)},${rand(0.1, 2).toFixed(2)},${rand(0.1, 2).toFixed(2)}`,
      processes: Math.round(rand(80, 180)),
      connections: Math.round(rand(20, 200)),
      createdAt: t,
    });
  }
  await db.serverMetric.createMany({ data: rows });
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  await ensureMockData();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const items = await db.serverMetric.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  // Compute stats
  const stats = computeStats(items);
  // Current snapshot = last
  const current = items.length ? items[items.length - 1] : null;
  return json({ ok: true, items, stats, current });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const item = await db.serverMetric.create({
      data: {
        server: body.server || "main",
        cpuUsage: Number(body.cpuUsage) || 0,
        ramUsage: Number(body.ramUsage) || 0,
        diskUsage: Number(body.diskUsage) || 0,
        bandwidthIn: Number(body.bandwidthIn) || 0,
        bandwidthOut: Number(body.bandwidthOut) || 0,
        uptime: Number(body.uptime) || 0,
        loadAvg: body.loadAvg || "0,0,0",
        processes: Number(body.processes) || 0,
        connections: Number(body.connections) || 0,
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
    // Clear metrics older than 7 days (housekeeping)
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const r = await db.serverMetric.deleteMany({ where: { createdAt: { lt: cutoff } } });
    return json({ ok: true, deleted: r.count });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}

function computeStats(items: any[]) {
  if (!items.length) {
    return { avgCpu: 0, avgRam: 0, avgDisk: 0, maxCpu: 0, maxRam: 0, maxDisk: 0, minCpu: 0, minRam: 0, minDisk: 0 };
  }
  const cpus = items.map((i) => i.cpuUsage);
  const rams = items.map((i) => i.ramUsage);
  const disks = items.map((i) => i.diskUsage);
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  return {
    avgCpu: Math.round(avg(cpus) * 100) / 100,
    avgRam: Math.round(avg(rams) * 100) / 100,
    avgDisk: Math.round(avg(disks) * 100) / 100,
    maxCpu: Math.max(...cpus),
    maxRam: Math.max(...rams),
    maxDisk: Math.max(...disks),
    minCpu: Math.min(...cpus),
    minRam: Math.min(...rams),
    minDisk: Math.min(...disks),
  };
}
