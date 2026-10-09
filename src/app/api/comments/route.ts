// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function rand_id() {
  return "c" + Math.random().toString(36).slice(2, 14) + Date.now().toString(36).slice(-8);
}

export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin") === "true";
  if (admin) {
    const auth = requireAuth(req);
    if (!auth.ok) return unauthorized();
  }
  const status = req.nextUrl.searchParams.get("status");
  const postId = req.nextUrl.searchParams.get("postId");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (postId) where.postId = postId;
  if (!admin && !status) where.status = "approved";

  const items = await db.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  // Public POST — create new comment
  try {
    const body = await req.json();
    const { postId, name, email, content, website } = body || {};
    if (!postId || !name || !email || !content) return badRequest("Missing required fields");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return badRequest("Invalid email");
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) return notFound("Post not found");
    const item = await db.comment.create({
      data: {
        id: rand_id(),
        postId,
        name: String(name),
        email: String(email),
        website: website ? String(website) : null,
        content: String(content),
        status: "pending",
        ip: req.headers.get("x-forwarded-for") || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });
    return json({ ok: true, id: item.id });
  } catch (e) {
    return json({ ok: false, error: "Failed to add comment" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const { id, status, content, parentId } = body;
    if (!id) return badRequest("id required");
    const update: Record<string, unknown> = {};
    if (status !== undefined) update.status = String(status);
    if (content !== undefined) update.content = String(content);
    if (parentId !== undefined) update.parentId = parentId || null;
    const item = await db.comment.update({ where: { id }, data: update });
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
    const existing = await db.comment.findUnique({ where: { id } });
    if (!existing) return notFound("Comment not found");
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";
    if (permanent) {
      await db.comment.delete({ where: { id } });
    } else {
      await db.comment.update({ where: { id }, data: { status: "trash" } });
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}
