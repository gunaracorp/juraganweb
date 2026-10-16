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

// PUT /api/customer/profile — update profil customer
// body: { name, phone, company, address, city, country }
export async function PUT(req: NextRequest) {
  const session = getCustomerSession(getToken(req));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    if (name.length < 3) return badRequest("Nama minimal 3 karakter");

    const updated = await db.customer.update({
      where: { id: session.id },
      data: {
        name,
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        country: body.country?.trim() || "Indonesia",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        address: true,
        city: true,
        country: true,
        avatar: true,
        verified: true,
      },
    });

    return json({ ok: true, customer: updated });
  } catch (e) {
    return json({ ok: false, error: "Update failed" }, 500);
  }
}
