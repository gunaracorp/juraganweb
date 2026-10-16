"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Users,
  TrendingUp,
  Wallet,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Server,
  ShieldCheck,
  Headphones,
  Check,
  ExternalLink,
  Trophy,
  Search,
  AlertCircle,
} from "lucide-react";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface Competitor {
  id: string;
  slug: string;
  name: string;
  url: string;
  logo: string | null;
  country: string;
  region: string;
  type: string;
  founded: number | null;
  customers: string | null;
  marketShare: string | null;
  description: string;
  pros: string[];
  cons: string[];
  features: string[];
  pricingFrom: string | null;
  uptime: string | null;
  datacenters: string | null;
  rating: number;
  popular: boolean;
  order: number;
}

type RegionTab = "all" | "global" | "indonesia";

const REGION_TABS: { value: RegionTab; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "global", label: "Global" },
  { value: "indonesia", label: "Indonesia" },
];

const WHY_JURAGAN = [
  {
    icon: Wallet,
    title: "Harga Lokal Terjangkau",
    desc: "Mulai Rp 14.900/bln — tanpa biaya setup, tanpa biaya tersembunyi. Bayar dalam Rupiah, bukan Dolar.",
  },
  {
    icon: Headphones,
    title: "Support Bahasa Indonesia 24/7",
    desc: "Tim support lokal siap 24 jam lewat WhatsApp, Live Chat, dan tiket — semuanya dalam Bahasa Indonesia.",
  },
  {
    icon: Globe,
    title: "Kombinasi Global + Lokal",
    desc: "Server Indonesia untuk performa lokal tercepat, plus akses ke infrastruktur global lewat mitra cloud terbaik.",
  },
];

const FAQS = [
  {
    q: "Bagaimana cara memilih provider hosting?",
    a: "Pertama, tentukan kebutuhan: jenis website (pribadi, bisnis, toko online, atau aplikasi), traffic perkiraan, dan budget. Untuk UMKM Indonesia, pilih provider dengan server lokal, support Bahasa Indonesia, dan harga Rupiah. Untuk kebutuhan global/skala besar, pertimbangkan AWS, Cloudflare, atau Hostinger. Selalu cek uptime SLA, kebijakan renewal, dan kualitas support sebelum membeli.",
  },
  {
    q: "Apakah harga termurah selalu terbaik?",
    a: "Tidak. Harga murah sering kali disertai trade-off: resource dibatasi, backup berbayar, support lambat, atau harga renewal melonjak. Bandingkan total biaya 2 tahun pertama (bukan hanya harga promo), cek kebijakan renewal, dan pastikan uptime serta layanan support memadai. JuraganWebsite menawarkan keseimbangan: harga lokal terjangkau dengan fitur lengkap.",
  },
  {
    q: "Apa bedanya hosting Indonesia vs global?",
    a: "Hosting Indonesia menempatkan server di dalam negeri, sehingga akses lebih cepat untuk pengunjung dari Indonesia, dukung pembayaran lokal (BCA, Mandiri, QRIS), dan support Bahasa Indonesia. Hosting global punya jangkauan data center luas dan cocok untuk audiens internasional. Untuk pasar Indonesia, hosting lokal memberi latensi 5-20x lebih rendah daripada server US/Eropa.",
  },
  {
    q: "Apakah JuraganWebsite lebih baik dari kompetitor?",
    a: "Untuk pelanggan Indonesia, JuraganWebsite menggabungkan kelebihan provider global (LiteSpeed, NVMe, SSL gratis, uptime 99.99%) dengan keunggulan lokal (server Indonesia, support WhatsApp 24/7 bahasa Indonesia, harga Rupiah, garansi 30 hari). Untuk skala enterprise atau workload spesifik, provider global seperti AWS tetap relevan — kami juga menyediakan VPS Cloud Server dan integrasi cloud hibrida.",
  },
  {
    q: "Bisakah saya migrasi dari provider lain?",
    a: "Ya, tim migrasi JuraganWebsite akan memindahkan seluruh file, database, email, dan DNS dari provider lama Anda secara gratis tanpa downtime. Cukup buat tiket di Client Area setelah berlangganan, dan proses umumnya selesai dalam 24 jam. Migrasi didukung dari Hostinger, Niagahoster, IDCloudHost, GoDaddy, Bluehost, dan provider lainnya.",
  },
];

const GLOBAL_LIST =
  "AWS, GoDaddy, Hostinger, Shopify, Bluehost, SiteGround, OVHcloud, Cloudflare, Namecheap, DreamHost";
const ID_LIST =
  "IDCloudHost, Niagahoster, Rumahweb, Exabytes, IDwebhost, DomaiNesia";

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} dari 5`}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < rounded
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="ml-1 text-xs font-semibold text-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function RegionBadge({ region }: { region: string }) {
  if (region === "indonesia") {
    return (
      <Badge className="border-0 bg-red-500/10 text-red-600 dark:text-red-400">
        🇮🇩 Indonesia
      </Badge>
    );
  }
  return (
    <Badge className="border-0 bg-primary/10 text-primary">
      <Globe className="mr-1 size-3" /> Global
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const label =
    type === "both"
      ? "Hosting + Domain"
      : type === "hosting"
        ? "Hosting"
        : "Domain";
  return (
    <Badge variant="outline" className="border-border/70 text-foreground/80">
      {label}
    </Badge>
  );
}

export default function ComparePage() {
  const [region, setRegion] = useState<RegionTab>("all");

  const { data, isLoading } = useQuery<Competitor[]>({
    queryKey: ["competitors", region],
    queryFn: async () => {
      const res = await apiFetch(`/competitors?region=${region}`);
      const json = await res.json();
      return (json?.items ?? []) as Competitor[];
    },
  });

  const items = data ?? [];

  return (
    <MarketingLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-mesh py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="size-3.5" /> Riset Pasar 2025-2026
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Perbandingan 16 Provider{" "}
                <span className="gradient-text">Hosting &amp; Domain</span>{" "}
                Terbesar
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-pretty text-base text-muted-foreground sm:text-lg">
                Kami riset 10 provider global terbesar ({GLOBAL_LIST}) + 6
                provider Indonesia terbesar ({ID_LIST}) untuk membantu Anda
                memilih yang terbaik.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/hosting">
                  <Button
                    type="button"
                    className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                  >
                    Lihat Paket Hosting
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/domain">
                  <Button type="button" variant="outline">
                    Cari Domain
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Tabel Perbandingan Lengkap
              </h2>
              <p className="mt-3 text-muted-foreground">
                Bandingkan 16 provider berdasarkan region, tipe layanan, harga,
                uptime, dan rating.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Tabs
                value={region}
                onValueChange={(v) => setRegion(v as RegionTab)}
              >
                <TabsList>
                  {REGION_TABS.map((t) => (
                    <TabsTrigger key={t.value} value={t.value}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trophy className="size-3.5 text-gold" />
                Baris dengan badge &quot;Populer&quot; ditandai highlight
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="mt-6 overflow-hidden border-primary/15">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-12 text-center">
                    <AlertCircle className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Tidak ada provider pada kategori ini.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[1100px]">
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="w-[260px]">Provider</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Berdiri</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Pangsa Pasar</TableHead>
                          <TableHead>Harga Mulai</TableHead>
                          <TableHead>Uptime</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((c) => (
                          <TableRow
                            key={c.id}
                            className={cn(
                              "transition-colors",
                              c.popular && "bg-primary/[0.04]",
                            )}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <span
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-base shadow-sm"
                                  aria-hidden
                                >
                                  {c.logo || "🌐"}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-semibold text-foreground">
                                      {c.name}
                                    </span>
                                    {c.popular ? (
                                      <Badge className="border-0 bg-gold/15 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wide text-gold">
                                        Populer
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {c.country}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RegionBadge region={c.region} />
                            </TableCell>
                            <TableCell>
                              <TypeBadge type={c.type} />
                            </TableCell>
                            <TableCell className="text-sm text-foreground/80">
                              {c.founded ?? "-"}
                            </TableCell>
                            <TableCell className="max-w-[180px]">
                              <span className="line-clamp-2 text-xs text-foreground/80">
                                {c.customers ?? "-"}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[160px]">
                              <span className="line-clamp-2 text-xs text-foreground/80">
                                {c.marketShare ?? "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold text-foreground">
                                {c.pricingFrom ?? "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
                                <Clock className="size-3 text-primary" />
                                {c.uptime ?? "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Stars rating={c.rating} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/providers/${c.slug}`}>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary"
                                >
                                  Lihat Detail
                                  <ArrowRight className="size-3.5" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Data dikumpulkan dari riset publik 2025-2026. Harga dapat berubah
              sewaktu-waktu — kunjungi website resmi provider untuk info terbaru.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHY JURAGANWEBSITE BAND */}
      <section className="bg-mesh py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                <Trophy className="size-3.5" /> Mengapa JuraganWebsite?
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Gabungan Terbaik dari Global &amp; Lokal
              </h2>
              <p className="mt-3 text-muted-foreground">
                Kami mengambil keunggulan provider global dan menambahkan sentuhan
                lokal yang tidak bisa ditandingi kompetitor asing.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {WHY_JURAGAN.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <Card className="group h-full border-primary/15 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-md">
                      <c.icon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/hosting">
                <Button
                  type="button"
                  className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                >
                  Mulai dari Rp 14.900/bln
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/domain">
                <Button type="button" variant="outline">
                  Cek Ketersediaan Domain
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* QUICK STATS BAND */}
      <section className="border-y border-border bg-card/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              {
                icon: Users,
                stat: "16",
                label: "Provider dianalisis",
              },
              {
                icon: Globe,
                stat: "10+6",
                label: "Global + Indonesia",
              },
              {
                icon: Server,
                stat: "Server ID",
                label: "Latensi 5-20x lebih cepat",
              },
              {
                icon: ShieldCheck,
                stat: "30 hari",
                label: "Garansi uang kembali",
              },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-foreground">
                      {s.stat}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Search className="size-3.5" /> FAQ
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Pertanyaan Umum
              </h2>
              <p className="mt-3 text-muted-foreground">
                Hal-hal yang sering ditanyakan sebelum memilih provider hosting
                dan domain.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <Accordion type="single" collapsible className="mt-8 w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-mesh py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-8 shadow-xl backdrop-blur sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Siap memilih{" "}
                    <span className="gradient-text">JuraganWebsite</span>?
                  </h2>
                  <p className="mt-3 max-w-xl text-muted-foreground">
                    Bandingkan sendiri, lalu mulai dari paket hosting Rp
                    14.900/bln atau cari domain impian Anda. Garansi 30 hari,
                    migrasi gratis, support Bahasa Indonesia 24/7.
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {[
                      "Server Indonesia lokal",
                      "LiteSpeed + NVMe SSD",
                      "SSL gratis selamanya",
                      "Backup harian otomatis",
                      "Support WhatsApp 24/7",
                      "Garansi uang kembali 30 hari",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-foreground/90"
                      >
                        <Check className="size-4 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                  <Link href="/hosting" className="w-full lg:w-auto">
                    <Button
                      type="button"
                      className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90 lg:w-auto"
                    >
                      Mulai Sekarang
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/domain" className="w-full lg:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full lg:w-auto"
                    >
                      <Globe className="size-4" />
                      Cari Domain
                    </Button>
                  </Link>
                  <a
                    href="https://wa.me/6281234559556"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="size-3.5" />
                    atau chat via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
