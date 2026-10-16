import { NextRequest } from "next/server";
import * as crypto from "crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { json, badRequest, unauthorized, notFound } from "@/lib/api-utils";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return req.nextUrl.searchParams.get("token");
}

// GET current user profile (auth required)
export async function GET(req: NextRequest) {
  const token = getToken(req);
  const session = getSession(token);
  if (!session) return unauthorized();
  const admin = await db.admin.findUnique({
    where: { username: session.username },
    select: { id: true, username: true, name: true, email: true, role: true, avatar: true, bio: true, lastLogin: true, createdAt: true },
  });
  if (!admin) return notFound("User not found");
  return json({ ok: true, user: admin });
}

// PUT update own profile or change password
export async function PUT(req: NextRequest) {
  const token = getToken(req);
  const session = getSession(token);
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const admin = await db.admin.findUnique({ where: { username: session.username } });
    if (!admin) return notFound("User not found");
    const update: Record<string, unknown> = {};

    if (body.name !== undefined) update.name = String(body.name);
    if (body.email !== undefined) update.email = String(body.email);
    if (body.avatar !== undefined) update.avatar = body.avatar || null;
    if (body.bio !== undefined) update.bio = body.bio || null;

    // Password change requires currentPassword verification
    if (body.newPassword) {
      if (!body.currentPassword) return badRequest("Current password required");
      if (admin.password !== hashPassword(String(body.currentPassword))) {
        return badRequest("Current password is incorrect");
      }
      if (body.newPassword !== body.confirmPassword) {
        return badRequest("New passwords don't match");
      }
      if (String(body.newPassword).length < 6) return badRequest("Password must be at least 6 characters");
      update.password = hashPassword(String(body.newPassword));
    }

    const updated = await db.admin.update({
      where: { id: admin.id },
      data: update,
      select: { id: true, username: true, name: true, email: true, role: true, avatar: true, bio: true, lastLogin: true, createdAt: true },
    });
    return json({ ok: true, user: updated });
  } catch (e) {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}
