"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Check, ShoppingCart, ArrowRight, Star, Globe, Loader2, HelpCircle, Server, Cpu,
  Cloud, Rocket, Mail, ShieldCheck, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal, formatRupiah, formatRupiahShort } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { useCart, type CartItem } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

interface Pkg {
  id: string;
  slug: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  category: string;
  price: number;
  priceYearly: number;
  setupFee: number;
  currency: string;
  billingCycle: string;
  features: string[];
  specs: Record<string, unknown>;
  popular: boolean;
  featured: boolean;
  active: boolean;
}

interface TldItem {
  id: string;
  tld: string;
  register: number;
  transfer: number;
  renew: number;
  popular: boolean;
  promo: boolean;
  promoPrice: number;
  category: string;
}

const TABS = [
  { id: "hosting", label: "Hosting", icon: Server },
  { id: "wordpress", label: "WordPress", icon: Rocket },
  { id: "vps", label: "VPS", icon: Cpu },
  { id: "cloud", label: "Cloud", icon: Cloud },
  { id: "email", label: "Email", icon: Mail },
  { id: "ssl", label: "SSL", icon: ShieldCheck },
  { id: "domain", label: "Domain", icon: Globe },
] as const;

const FAQS = [
  {
    q: "Apakah ada biaya tersembunyi?",
    a: "Tidak. Harga yang tertera sudah termasuk semua biaya. Anda hanya membayar sesuai paket yang dipilih. Tidak ada biaya setup tambahan untuk paket hosting dan WordPress.",
  },
  {
    q: "Bisakah saya upgrade paket di tengah jalan?",
    a: "Tentu! Anda dapat upgrade kapan saja melalui Client Area. Selisih harga dihitung secara prorata, jadi Anda hanya membayar selisih periode yang tersisa.",
  },
  {
    q: "Metode pembayaran apa saja yang diterima?",
    a: "Kami menerima transfer bank (BCA, BNI, Mandiri, BRI), virtual account, e-wallet (OVO, DANA, GoPay, ShopeePay), QRIS, dan kartu kredit/debit.",
  },
  {
    q: "Apakah ada garansi uang kembali?",
    a: "Ya, kami menyediakan garansi 30 hari uang kembali untuk semua paket hosting, WordPress hosting, dan VPS. Tanpa pertanyaan, tanpa ribet.",
  },
  {
    q: "Berapa lama aktivasi layanan setelah pembayaran?",
    a: "Sebagian besar layanan otomatis aktif dalam 1-5 menit setelah pembayaran dikonfirmasi. Untuk VPS tertentu mungkin butuh hingga 30 menit.",
  },
  {
    q: "Apakah harga sudah termasuk PPN?",
    a: "Ya, semua harga sudah termasuk PPN 11% sesuai peraturan perpajakan Indonesia. Tidak ada biaya tambahan lagi.",
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <PricingTabs />
      <FaqSection />
      <CtaBand />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary">
            <Star className="mr-1 size-3" /> Harga Transparan
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Bandingkan <span className="gradient-text">Semua Harga</span> di Satu Tempat
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Pilih paket hosting, VPS, cloud, WordPress, email, SSL, atau domain yang paling sesuai dengan
            kebutuhan dan budget Anda. Semua sudah termasuk PPN.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PricingTabs() {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="hosting" className="w-full">
          <div className="flex justify-center overflow-x-auto pb-2">
            <TabsList className="flex h-auto flex-nowrap gap-1 bg-card p-1.5 sm:flex-wrap">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-primary-foreground"
                >
                  <t.icon className="size-4" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {TABS.filter((t) => t.id !== "domain").map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-8">
              <PackageGrid category={t.id} />
            </TabsContent>
          ))}

          <TabsContent value="domain" className="mt-8">
            <DomainPricingTable />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function PackageGrid({ category }: { category: string }) {
  const { data, isLoading } = useQuery<{ ok: boolean; items: Pkg[] }>({
    queryKey: ["packages", category],
    queryFn: async () => {
      const res = await apiFetch(`/packages?category=${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error("Gagal memuat paket");
      return res.json();
    },
  });

  const items = data?.items ?? [];
  const addItem = useCart((s) => s.addItem);

  const addPkgToCart = (p: Pkg) => {
    const item: Omit<CartItem, "id"> = {
      type: p.category as CartItem["type"],
      packageSlug: p.slug,
      name: p.nameId,
      period: p.billingCycle === "yearly" ? 12 : p.billingCycle === "one-time" ? 0 : 1,
      billingCycle: (p.billingCycle as CartItem["billingCycle"]) ?? "monthly",
      price: p.billingCycle === "yearly" && p.priceYearly > 0 ? p.priceYearly : p.price,
      qty: 1,
    };
    addItem(item);
    toast.success(`${p.nameId} ditambahkan ke keranjang`);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-10 w-1/2 animate-pulse rounded bg-muted" />
              <div className="mt-6 space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-3.5 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
              <div className="mt-6 h-10 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="p-12 text-center">
          <HelpCircle className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Belum ada paket pada kategori ini. Silakan hubungi kami untuk penawaran custom.
          </p>
          <Link href="/contact" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Hubungi Sales <ArrowRight className="size-3.5" /></Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Order: popular/featured first
  const sorted = [...items].sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.price - b.price;
  });

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((p, i) => (
        <Reveal key={p.id} delay={Math.min(i * 0.08, 0.4)}>
          <PackageCard pkg={p} onAdd={() => addPkgToCart(p)} />
        </Reveal>
      ))}
    </div>
  );
}

function PackageCard({ pkg, onAdd }: { pkg: Pkg; onAdd: () => void }) {
  const isPopular = pkg.popular;
  const yearlyPrice = pkg.priceYearly > 0 ? pkg.priceYearly : pkg.price * 12;
  const isYearly = pkg.billingCycle === "yearly";
  const features = Array.isArray(pkg.features) ? pkg.features : [];
  const periodLabel =
    pkg.billingCycle === "one-time"
      ? "sekali bayar"
      : pkg.billingCycle === "yearly"
        ? "/tahun"
        : "/bulan";

  return (
    <Card
      className={
        "relative flex h-full flex-col overflow-hidden border-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg " +
        (isPopular ? "border-primary/40 shadow-md ring-2 ring-primary/30" : "")
      }
    >
      {isPopular && (
        <div className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-bl-lg bg-brand-gradient px-3 py-1 text-xs font-bold text-primary-foreground shadow">
          <Crown className="size-3" /> Terpopuler
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground">{pkg.nameId}</CardTitle>
        {pkg.descId && (
          <CardDescription className="line-clamp-2 text-sm">{pkg.descId}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">
            {formatRupiah(isYearly ? yearlyPrice : pkg.price)}
          </span>
          <span className="pb-1 text-sm text-muted-foreground">{periodLabel}</span>
        </div>
        {isYearly && pkg.price > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Setara {formatRupiahShort(Math.round(yearlyPrice / 12))}/bln
          </p>
        )}

        <ul className="mt-5 flex-1 space-y-2.5">
          {features.slice(0, 8).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
          {features.length > 8 && (
            <li className="text-xs font-medium text-primary">+ {features.length - 8} fitur lainnya</li>
          )}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onAdd} className={isPopular ? "bg-brand-gradient text-primary-foreground" : ""}>
            <ShoppingCart className="size-4" /> Pesan Sekarang
          </Button>
          <Link href="/cart" className="block">
            <Button variant="outline" className="w-full">Lihat Keranjang</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainPricingTable() {
  const { data, isLoading } = useQuery<{ ok: boolean; items: TldItem[] }>({
    queryKey: ["tlds-pricing"],
    queryFn: async () => {
      const res = await apiFetch("/domains/tlds");
      if (!res.ok) throw new Error("Gagal memuat TLD");
      return res.json();
    },
  });

  const items = data?.items ?? [];

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Daftar Harga Domain</h3>
            <p className="text-xs text-muted-foreground">Harga per tahun, sudah termasuk PPN.</p>
          </div>
          <Link href="/domain">
            <Button size="sm" variant="outline">
              <Globe className="size-3.5" /> Cek Domain
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="h-11 px-4 text-sm font-semibold">TLD</TableHead>
              <TableHead className="h-11 px-4 text-right text-sm font-semibold">Register</TableHead>
              <TableHead className="h-11 px-4 text-right text-sm font-semibold">Transfer</TableHead>
              <TableHead className="h-11 px-4 text-right text-sm font-semibold">Perpanjang</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin text-primary" />
                  <span className="mt-2 block text-sm">Memuat daftar TLD...</span>
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{t.tld}</span>
                      {t.popular && <Badge className="bg-primary/15 text-primary">Populer</Badge>}
                      {t.promo && <Badge className="bg-gold/15 text-gold-foreground">Promo</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {t.promo && t.promoPrice > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-foreground">{formatRupiah(t.promoPrice)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatRupiah(t.register)}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-foreground">{formatRupiah(t.register)}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-muted-foreground">{formatRupiah(t.transfer)}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-muted-foreground">{formatRupiah(t.renew)}</TableCell>
                </TableRow>
              ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Belum ada TLD tersedia.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FaqSection() {
  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">FAQ</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Punya pertanyaan lain? Tim support kami siap membantu 24/7.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <Card className="border-border bg-background shadow-sm">
            <CardContent className="p-2 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="px-3 text-left text-base font-semibold text-foreground">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-3 text-sm text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center shadow-xl sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-gold/20 blur-3xl" />
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              Masih Bingung Pilih Paket?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Konsultasi gratis dengan tim ahli kami. Kami bantu pilih paket paling tepat untuk kebutuhan bisnis Anda.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="shadow-md">
                  Konsultasi Gratis <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/knowledge">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Baca Tutorial
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
