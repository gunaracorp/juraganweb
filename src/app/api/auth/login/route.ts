// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { authenticate, generateToken } from "@/lib/auth";
import { json, badRequest } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body || {};
    if (!username || !password) return badRequest("Username and password required");
    const user = await authenticate(String(username), String(password));
    if (!user) return json({ ok: false, error: "Invalid credentials" }, 401);
    const token = generateToken(user);
    return json({ ok: true, token, user });
  } catch (e) {
    return json({ ok: false, error: "Server error" }, 500);
  }
}
