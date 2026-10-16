// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth";
import { getToken, ok } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const token = getToken(req);
  destroySession(token);
  return ok({ ok: true });
}
