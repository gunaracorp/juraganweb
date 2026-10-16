export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/lib/api-utils";
import { getCustomerSession } from "@/lib/customer-auth";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return req.nextUrl.searchParams.get("token");
}

// GET /api/customer/invoices — daftar invoice milik customer (session-gated).
// Workaround karena GET /api/invoices (admin) butuh auth admin.
export async function GET(req: NextRequest) {
  const session = getCustomerSession(getToken(req));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = { customerId: session.id };
  if (status) where.status = status;

  const items = await db.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const parsed = items.map((i) => {
    let parsedItems: unknown[] = [];
    try { parsedItems = JSON.parse(i.items || "[]"); } catch { parsedItems = []; }
    return { ...i, items: parsedItems };
  });

  return json({ ok: true, items: parsed });
}
