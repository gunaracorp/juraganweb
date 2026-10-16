export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest } from "@/lib/api-utils";
import { getCustomerSession } from "@/lib/customer-auth";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return req.nextUrl.searchParams.get("token");
}

async function genInvoiceNumber(year: number): Promise<string> {
  const prefix = `INV-${year}-`;
  const invs = await db.invoice.findMany({ where: { number: { startsWith: prefix } } });
  let max = 0;
  for (const i of invs) {
    const seq = parseInt(i.number.replace(prefix, ""), 10);
    if (!isNaN(seq) && seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

async function genOrderInvoice(year: number): Promise<string> {
  const prefix = `INV-${year}-`;
  const invs = await db.invoice.findMany({ where: { number: { startsWith: prefix } } });
  let max = 0;
  for (const i of invs) {
    const seq = parseInt(i.number.replace(prefix, ""), 10);
    if (!isNaN(seq) && seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

// GET /api/customer/orders — list pesanan milik customer
export async function GET(req: NextRequest) {
  const session = getCustomerSession(getToken(req));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const orders = await db.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return json({ ok: true, items: orders });
}

// POST /api/customer/orders — buat order baru + invoice + customer services
// body: { items: [{ name, category, billingCycle, price, period, domain? }], paymentMethod }
export async function POST(req: NextRequest) {
  const session = getCustomerSession(getToken(req));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const items: Array<{
      name: string;
      category: string;
      billingCycle: string;
      price: number;
      period: number;
      domain?: string;
    }> = Array.isArray(body.items) ? body.items : [];
    const paymentMethod: string = body.paymentMethod || "bank_transfer";

    if (items.length === 0) return badRequest("Item pesanan kosong");

    const customer = await db.customer.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true },
    });
    if (!customer) return json({ ok: false, error: "Customer tidak ditemukan" }, 404);

    const subtotal = items.reduce((sum, i) => sum + Number(i.price || 0) * 1, 0);
    const discount = 0;
    const tax = 0;
    const total = subtotal - discount + tax;
    const year = new Date().getFullYear();
    const invoiceNumber = await genOrderInvoice(year);

    const order = await db.order.create({
      data: {
        invoice: invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        items: JSON.stringify(items),
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
      },
    });

    // buat invoice terkait
    await db.invoice.create({
      data: {
        number: invoiceNumber,
        orderId: order.id,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        items: JSON.stringify(items),
        subtotal,
        discount,
        tax,
        total,
        currency: "IDR",
        status: "unpaid",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
    });

    // buat CustomerService rows untuk tiap item
    for (const it of items) {
      const priceNum = Number(it.price || 0);
      const period = Number(it.period || 1);
      let expiresAt: Date | null = null;
      const cat = (it.category || "service").toLowerCase();

      if (cat === "domain") {
        // domain: period = tahun
        expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * Math.max(1, period));
      } else {
        // hosting/vps/etc: billingCycle monthly → 30 hari, yearly → 365 hari
        const cycle = (it.billingCycle || "monthly").toLowerCase();
        if (cycle === "yearly" || cycle === "annually") {
          expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * Math.max(1, period));
        } else if (cycle === "one-time") {
          expiresAt = null;
        } else {
          expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * Math.max(1, period));
        }
      }

      await db.customerService.create({
        data: {
          customerId: customer.id,
          orderId: order.id,
          domain: it.domain || null,
          name: it.name || "Layanan",
          category: cat,
          billingCycle: it.billingCycle || "monthly",
          price: priceNum,
          status: "active",
          expiresAt,
          serverName: cat === "domain" ? null : `sg-${Math.floor(Math.random() * 8 + 1)}.juraganhost.id`,
        },
      });
    }

    // update statistik customer
    await db.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: total },
      },
    });

    // suppress unused warning
    void genInvoiceNumber;

    return json({ ok: true, order });
  } catch (e) {
    return json({ ok: false, error: "Create order failed" }, 500);
  }
}
