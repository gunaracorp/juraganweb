import { NextRequest } from "next/server";
import { getToken, json, unauthorized } from "@/lib/api-utils";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const session = getSession(token);
  if (!session) return unauthorized();
  return json({ ok: true, user: session });
}
