// Stateless auth helpers — HMAC-signed token (no server-side session storage needed)
// This works reliably across Next.js dev hot reloads and serverless/edge environments,
// and is compatible with shared hosting deployments.
import * as crypto from "crypto";
import { db } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET || "juraganwebsite-secret-2007-digiman";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

interface TokenPayload {
  username: string;
  name: string;
  role: string;
  exp: number; // epoch ms
}

export function generateToken(user: { username: string; name: string; role: string }): string {
  const payload: TokenPayload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function getSession(token: string | null) {
  if (!token) return null;
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as TokenPayload;
    if (payload.exp < Date.now()) return null;
    return { username: payload.username, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

export function destroySession(_token: string | null) {
  // Stateless — no server-side session to destroy.
  // Clients should discard the token. We rely on expiry for security.
  void _token;
}

export async function authenticate(username: string, password: string) {
  const admin = await db.admin.findUnique({ where: { username } });
  if (!admin) return null;
  if (admin.password !== hashPassword(password)) return null;
  // Update lastLogin timestamp
  try {
    await db.admin.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });
  } catch {}
  return { username: admin.username, name: admin.name, role: admin.role };
}
