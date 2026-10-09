export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, badRequest } from "@/lib/api-utils";

// GET /api/domains/check?domain=example.com
// Simulasi pengecekan ketersediaan domain (deterministik berdasarkan hash nama)
function hashAvailable(name: string): boolean {
  // ~65% available untuk demo
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 100 < 65;
}

function splitTld(domain: string): { sld: string; tld: string } | null {
  const d = domain.trim().toLowerCase();
  // coba match TLD terpanjang dulu
  const parts = d.split(".");
  if (parts.length < 2) return null;
  // TLD multi-level: .co.id, .web.id, .or.id, .sch.id, .ac.id, .my.id, .biz.id, .net.id, .or.id
  const twoLevel = ["co.id", "web.id", "or.id", "sch.id", "ac.id", "my.id", "biz.id", "net.id", "desa.id", "ponpes.id"];
  if (parts.length >= 3) {
    const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (twoLevel.includes(lastTwo)) {
      const sld = parts.slice(0, -2).join(".");
      return { sld, tld: `.${lastTwo}` };
    }
  }
  const tld = `.${parts[parts.length - 1]}`;
  const sld = parts.slice(0, -1).join(".");
  return { sld, tld };
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return badRequest("domain required");
  const split = splitTld(domain);
  if (!split) return badRequest("invalid domain format");

  const tldRecord = await db.domainTld.findUnique({ where: { tld: split.tld } });
  const available = hashAvailable(domain);
  const price = tldRecord?.register ?? 0;
  const promo = tldRecord?.promo ? tldRecord.promoPrice : null;

  return json({
    ok: true,
    domain,
    sld: split.sld,
    tld: split.tld,
    available,
    price,
    promo,
    currency: "IDR",
  });
}
