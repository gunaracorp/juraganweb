import { NextRequest } from "next/server";
import * as crypto from "crypto";
import { db } from "@/lib/db";
import { json, badRequest, unauthorized, notFound, requireAuth } from "@/lib/api-utils";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const items = await db.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, name: true, email: true, role: true, avatar: true, bio: true, lastLogin: true, createdAt: true },
  });
  return json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const { username, password, name, email, role } = body;
    if (!username || !password || !name || !email) return badRequest("Missing required fields");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return badRequest("Invalid email");
    const existing = await db.admin.findUnique({ where: { username } });
    if (existing) return badRequest("Username already exists");
    const item = await db.admin.create({
      data: {
        username: String(username),
        password: hashPassword(String(password)),
        name: String(name),
        email: String(email),
        role: role || "editor",
      },
    });
    return json({ ok: true, item: { id: item.id, username: item.username, name: item.name, email: item.email, role: item.role } });
  } catch (e) {
    return json({ ok: false, error: "Create failed" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  try {
    const body = await req.json();
    const { id, name, email, role, password, avatar, bio } = body;
    if (!id) return badRequest("id required");
    const existing = await db.admin.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name);
    if (email !== undefined) update.email = String(email);
    if (role !== undefined) update.role = String(role);
    if (avatar !== undefined) update.avatar = avatar || null;
    if (bio !== undefined) update.bio = bio || null;
    if (password) update.password = hashPassword(String(password));
    const item = await db.admin.update({ where: { id }, data: update });
    return json({ ok: true, item: { id: item.id, username: item.username, name: item.name, email: item.email, role: item.role, avatar: item.avatar, bio: item.bio } });
  } catch (e) {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return badRequest("id required");
  if (id === "self" || auth.user.username === req.nextUrl.searchParams.get("username")) {
    return badRequest("Cannot delete your own account");
  }
  try {
    const existing = await db.admin.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");
    if (existing.username === auth.user.username) return badRequest("Cannot delete your own account");
    await db.admin.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "Delete failed" }, 500);
  }
}
