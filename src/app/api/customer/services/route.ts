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

// GET /api/customer/services — daftar layanan aktif pelanggan
export async function GET(req: NextRequest) {
  const session = getCustomerSession(getToken(req));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const services = await db.customerService.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: services });
}
