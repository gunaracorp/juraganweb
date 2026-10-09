export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest } from "@/lib/api-utils";
import { authenticateCustomer, generateCustomerToken } from "@/lib/customer-auth";

// POST /api/customer/login { email, password }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    if (!email || !password) return badRequest("Email dan password wajib diisi");

    const customer = await authenticateCustomer(email, password);
    if (!customer) return json({ ok: false, error: "Email atau password salah" }, 401);

    const token = generateCustomerToken(customer);
    return json({ ok: true, token, customer });
  } catch (e) {
    return json({ ok: false, error: "Login failed" }, 500);
  }
}
