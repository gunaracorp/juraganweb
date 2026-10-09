// Stateless customer auth — HMAC-signed token (mirrors admin auth pattern)
// Works across dev hot-reloads & serverless/edge. No server session storage.
import * as crypto from "crypto";
import { db } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET || "juraganwebsite-secret-2007-digiman";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

interface CustomerTokenPayload {
  id: string;
  email: string;
  name: string;
  exp: number; // epoch ms
}

export function generateCustomerToken(c: { id: string; email: string; name: string }): string {
  const payload: CustomerTokenPayload = {
    ...c,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function getCustomerSession(token: string | null) {
  if (!token) return null;
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as CustomerTokenPayload;
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function authenticateCustomer(email: string, password: string) {
  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer) return null;
  if (customer.password !== hashPassword(password)) return null;
  if (customer.status !== "active") return null;
  try {
    await db.customer.update({ where: { id: customer.id }, data: { lastLogin: new Date() } });
  } catch {}
  return { id: customer.id, email: customer.email, name: customer.name };
}
