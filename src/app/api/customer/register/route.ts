export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest } from "@/lib/api-utils";
import { hashPassword, generateCustomerToken } from "@/lib/customer-auth";

// POST /api/customer/register { name, email, password, phone? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const phone = body.phone?.trim() || null;

    if (name.length < 3) return badRequest("Nama minimal 3 karakter");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return badRequest("Email tidak valid");
    if (password.length < 6) return badRequest("Password minimal 6 karakter");

    const existing = await db.customer.findUnique({ where: { email } });
    if (existing) return badRequest("Email sudah terdaftar. Silakan login.");

    const customer = await db.customer.create({
      data: {
        email,
        name,
        phone,
        password: hashPassword(password),
        status: "active",
        verified: false,
      },
    });

    const token = generateCustomerToken({ id: customer.id, email: customer.email, name: customer.name });
    return json({
      ok: true,
      token,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
  } catch (e) {
    return json({ ok: false, error: "Registration failed" }, 500);
  }
}
