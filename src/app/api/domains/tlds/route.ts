export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/lib/api-utils";

// GET /api/domains/tlds — daftar harga TLD untuk halaman domain
export async function GET() {
  const tlds = await db.domainTld.findMany({
    where: { active: true },
    orderBy: [{ popular: "desc" }, { tld: "asc" }],
  });
  return json({ ok: true, items: tlds });
}
