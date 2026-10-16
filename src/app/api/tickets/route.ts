// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

async function genTicketNumber(year: number): Promise<string> {
  const prefix = `TKT-${year}-`;
  const tickets = await db.ticket.findMany({ where: { number: { startsWith: prefix } } });
  let max = 0;
  for (const t of tickets) {
    const seq = parseInt(t.number.replace(prefix, ""), 10);
    if (!isNaN(seq) && seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const admin = url.searchParams.get("admin") === "true";
  const email = url.searchParams.get("email");
  const status = url.searchParams.get("status");

  if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const items = await db.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return json({ ok: true, items });
  }

  // Public: require email to fetch own tickets
  if (!email) return badRequest("email required");
  const where: Record<string, unknown> = { customerEmail: email };
  if (status) where.status = status;
  const items = await db.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  // Public: customers can create tickets without auth
  try {
    const body = await req.json();
    if (!body.customerEmail) return badRequest("email required");
    if (!body.subject) return badRequest("subject required");
    const year = new Date().getFullYear();
    const number = await genTicketNumber(year);
    const item = await db.ticket.create({
      data: {
        number,
        customerId: body.customerId || null,
        customerName: body.customerName || "",
        customerEmail: body.customerEmail,
        subject: body.subject,
        category: body.category || "general",
        priority: body.priority || "normal",
        status: "open",
        department: body.department || "support",
        assignedTo: body.assignedTo || null,
        message: body.message || "",
        tags: body.tags || "",
      },
    });
    return json({ ok: true, item });
  } catch (e) {
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
    const existing = await db.ticket.findUnique({ where: { id } });
    if (!existing) return notFound("Ticket not found");
    const update: Record<string, unknown> = {};
    for (const k of ["customerId", "customerName", "customerEmail", "subject", "category", "priority", "status", "department", "assignedTo", "message", "tags"]) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    if (fields.rating !== undefined) update.rating = Number(fields.rating);
    if (fields.resolvedAt !== undefined) update.resolvedAt = fields.resolvedAt ? new Date(fields.resolvedAt) : null;

    // Action: respond — set firstResponseAt on first admin reply
    const action = req.nextUrl.searchParams.get("action");
    if (action === "respond" && !existing.firstResponseAt) {
      update.firstResponseAt = new Date();
    }
    if (fields.status === "resolved" && !existing.resolvedAt) {
      update.resolvedAt = new Date();
    }
    const item = await db.ticket.update({ where: { id }, data: update });
    // Insert TicketReply if message provided on respond
    if (action === "respond" && fields.reply) {
      await db.ticketReply.create({
        data: {
          ticketId: id,
          author: auth.user.name,
          authorRole: "admin",
          message: String(fields.reply),
          internal: !!fields.internal,
        },
      });
    }
    await logActivity(req, auth.user, "updated", "ticket", item.id, item.number);
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
    const existing = await db.ticket.findUnique({ where: { id } });
    if (!existing) return notFound("Ticket not found");
    await db.ticket.delete({ where: { id } });
    await logActivity(req, auth.user, "deleted", "ticket", id, existing.number);
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
