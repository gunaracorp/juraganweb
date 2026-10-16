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
  const items = await db.stagingEnv.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) return badRequest("name required");
    if (!body.domain) return badRequest("domain required");
    const item = await db.stagingEnv.create({
      data: {
        name: body.name,
        domain: body.domain,
        sourceDomain: body.sourceDomain || "",
        branch: body.branch || "main",
        status: body.status || "idle",
        deployUrl: body.deployUrl || `https://staging.${body.domain}`,
        autoSync: !!body.autoSync,
      },
    });
    await logActivity(req, auth.user, "created", "staging", item.id, item.name);
    return json({ ok: true, item });
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
    const existing = await db.stagingEnv.findUnique({ where: { id } });
    if (!existing) return notFound("Staging env not found");
    const update: Record<string, unknown> = {};
    for (const k of ["name", "domain", "sourceDomain", "branch", "status", "deployUrl"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.autoSync !== undefined) update.autoSync = !!fields.autoSync;

    if (action === "deploy") {
      // Simulate deploy: status='deploying' → 'running' after 2s
      update.status = "deploying";
      update.lastDeploy = new Date();
      const item = await db.stagingEnv.update({ where: { id }, data: update });
      setTimeout(async () => {
        try { await db.stagingEnv.update({ where: { id }, data: { status: "running" } }); } catch {}
      }, 2000);
      await logActivity(req, auth.user, "deployed", "staging", item.id, item.name);
      return json({ ok: true, item });
    }

    const item = await db.stagingEnv.update({ where: { id }, data: update });
    await logActivity(req, auth.user, "updated", "staging", item.id, item.name);
    return json({ ok: true, item });
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
    const existing = await db.stagingEnv.findUnique({ where: { id } });
    if (!existing) return notFound("Staging env not found");
    await db.stagingEnv.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "staging", id, existing.name);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
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
