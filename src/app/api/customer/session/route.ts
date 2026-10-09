export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, requireAuth } from "@/lib/api-utils";
import { getCustomerSession } from "@/lib/customer-auth";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return req.nextUrl.searchParams.get("token");
}

// GET /api/customer/session — validasi token, return profil + statistik
export async function GET(req: NextRequest) {
  const session = getCustomerSession(getToken(req));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const customer = await db.customer.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, phone: true, company: true, address: true, city: true, country: true, avatar: true, verified: true, totalSpent: true, totalOrders: true, lastLogin: true, createdAt: true },
  });
  if (!customer) return json({ ok: false, error: "Customer not found" }, 404);

  const [services, orders, invoices, tickets] = await Promise.all([
    db.customerService.count({ where: { customerId: customer.id } }),
    db.order.count({ where: { customerId: customer.id } }),
    db.invoice.count({ where: { customerId: customer.id } }),
    db.ticket.count({ where: { customerEmail: customer.email } }),
  ]);

  return json({
    ok: true,
    customer,
    stats: { services, orders, invoices, tickets },
  });
}
