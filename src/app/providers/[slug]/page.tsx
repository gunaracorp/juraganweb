"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Users,
  TrendingUp,
  Wallet,
  Clock,
  Server,
  Star,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  ShieldCheck,
  Headphones,
  Zap,
  DatabaseBackup,
  ChevronRight,
} from "lucide-react";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-label={`Rating ${rating} dari 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              size,
              i < rounded
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-foreground">
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

const JW_ADVANTAGES = [
  {
    icon: Server,
    title: "Server Indonesia Lokal",
    desc: "Latensi 5-20x lebih cepat untuk pengunjung dari Indonesia dibanding server US/Eropa.",
  },
  {
    icon: Wallet,
    title: "Harga mulai Rp 14.900/bln",
    desc: "Bayar dalam Rupiah, tanpa biaya setup, tanpa biaya tersembunyi, harga renewal transparan.",
  },
  {
    icon: Headphones,
    title: "Support WhatsApp 24/7",
    desc: "Tim support lokal siap 24 jam penuh dalam Bahasa Indonesia — bukan call center luar negeri.",
  },
  {
    icon: Zap,
    title: "LiteSpeed + NVMe",
    desc: "Server LiteSpeed Enterprise dengan storage NVMe SSD — loading hingga 50x lebih cepat dari Apache.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi 30 Hari",
    desc: "Tidak puas? Uang kembali 100% dalam 30 hari pertama, tanpa pertanyaan rumit.",
  },
  {
    icon: DatabaseBackup,
    title: "Backup Harian Otomatis",
    desc: "Data website diamankan otomatis setiap hari dengan retention hingga 30 hari — gratis.",
  },
];

export default function ProviderDetailPage() {
  return (
    <MarketingLayout>
      <ProviderDetailInner />
    </MarketingLayout>
  );
}

function ProviderDetailInner() {
  // Read slug via useParams (client)
  const params = useParamsSlug();
  const slug = params ?? "";

  const { data: item, isLoading } = useQuery<Competitor | null>({
    queryKey: ["competitor", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await apiFetch(`/competitors?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.item ?? null) as Competitor | null;
    },
    enabled: !!slug,
  });

  const { data: others } = useQuery<Competitor[]>({
    queryKey: ["competitors", "all"],
    queryFn: async () => {
      const res = await apiFetch(`/competitors?region=all`);
      const json = await res.json();
      return (json?.items ?? []) as Competitor[];
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Provider tidak ditemukan
        </h1>
        <p className="mt-3 text-muted-foreground">
          Maaf, provider yang Anda cari tidak tersedia atau telah dihapus dari
          database riset kami.
        </p>
        <Link href="/compare" className="mt-6 inline-block">
          <Button
            type="button"
            className="bg-brand-gradient text-primary-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Perbandingan
          </Button>
        </Link>
      </div>
    );
  }

  const related = (others ?? [])
    .filter((c) => c.region === item.region && c.slug !== item.slug)
    .slice(0, 5);

  return (
    <div className="relative py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Reveal>
          <nav
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">
              Beranda
            </Link>
            <ChevronRight className="size-3" />
            <Link href="/compare" className="hover:text-primary">
              Bandingkan
            </Link>
            <ChevronRight className="size-3" />
            <span className="font-medium text-foreground">{item.name}</span>
          </nav>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* MAIN CONTENT */}
          <div className="min-w-0">
            {/* HERO */}
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-mesh p-6 sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-4xl shadow-lg">
                    {item.logo || "🌐"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <RegionBadge region={item.region} />
                      <TypeBadge type={item.type} />
                      {item.popular ? (
                        <Badge className="border-0 bg-gold/15 text-gold">
                          <Sparkles className="mr-1 size-3" /> Populer
                        </Badge>
                      ) : null}
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                      {item.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-4 text-primary" />
                        {item.country}
                      </span>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Globe className="size-4" />
                          {(() => {
                            try {
                              return new URL(item.url).hostname.replace(
                                /^www\./,
                                "",
                              );
                            } catch {
                              return item.url;
                            }
                          })()}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <Stars rating={item.rating} />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            type="button"
                            className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                          >
                            Kunjungi Website
                            <ExternalLink className="size-4" />
                          </Button>
                        </a>
                      ) : null}
                      <Link href="/hosting">
                        <Button type="button" variant="outline">
                          Bandingkan dengan JuraganWebsite
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* QUICK STATS */}
            <Reveal delay={0.05}>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard
                  icon={Building2}
                  label="Berdiri"
                  value={item.founded ? String(item.founded) : "-"}
                />
                <StatCard
                  icon={Users}
                  label="Pelanggan"
                  value={item.customers ?? "-"}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Pangsa Pasar"
                  value={item.marketShare ?? "-"}
                />
                <StatCard
                  icon={Wallet}
                  label="Harga Mulai"
                  value={item.pricingFrom ?? "-"}
                />
                <StatCard
                  icon={Clock}
                  label="Uptime"
                  value={item.uptime ?? "-"}
                />
                <StatCard
                  icon={Server}
                  label="Data Center"
                  value={item.datacenters ?? "-"}
                />
              </div>
            </Reveal>

            {/* PROS & CONS */}
            <Reveal delay={0.05}>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
                  <CardContent className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="size-4" />
                      </span>
                      Kelebihan
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {item.pros.length === 0 ? (
                        <li className="text-sm text-muted-foreground">
                          Tidak ada data.
                        </li>
                      ) : (
                        item.pros.map((p, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-foreground/90"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>{p}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-rose-500/20 bg-rose-500/[0.03]">
                  <CardContent className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        <X className="size-4" />
                      </span>
                      Kekurangan
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {item.cons.length === 0 ? (
                        <li className="text-sm text-muted-foreground">
                          Tidak ada data.
                        </li>
                      ) : (
                        item.cons.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-foreground/90"
                          >
                            <X className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            <span>{c}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </Reveal>

            {/* FEATURES */}
            {item.features.length > 0 ? (
              <Reveal delay={0.05}>
                <div className="mt-8">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
                    <Sparkles className="size-5 text-gold" />
                    Layanan &amp; Fitur Utama
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.features.map((f, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-primary/30 bg-primary/5 px-3 py-1 text-sm text-foreground/90"
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}

            {/* DESCRIPTION */}
            <Reveal delay={0.05}>
              <Card className="mt-8 border-primary/15">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
                    <Building2 className="size-5 text-primary" />
                    Tentang {item.name}
                  </h2>
                  <Separator className="my-4" />
                  <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>

            {/* JW CTA BAND */}
            <Reveal delay={0.05}>
              <div className="mt-8 relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-lg backdrop-blur sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                        <TrendingUp className="size-3.5" /> Bandingkan dengan
                        JuraganWebsite
                      </span>
                      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        Kenapa beralih ke{" "}
                        <span className="gradient-text">JuraganWebsite</span>?
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                        Keunggulan provider global, ditambah sentuhan lokal yang
                        tidak bisa ditandingi {item.name}.
                      </p>
                    </div>
                    <Link href="/hosting">
                      <Button
                        type="button"
                        className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                      >
                        Lihat Paket Hosting
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {JW_ADVANTAGES.map((a) => (
                      <div
                        key={a.title}
                        className="rounded-xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/30"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <a.icon className="size-4.5" />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-foreground">
                          {a.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {a.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* BACK LINK */}
            <Reveal delay={0.05}>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Link href="/compare">
                  <Button type="button" variant="ghost">
                    <ArrowLeft className="size-4" />
                    Kembali ke Perbandingan
                  </Button>
                </Link>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Kunjungi {item.name}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
            </Reveal>
          </div>

          {/* SIDEBAR — Provider Lainnya */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Reveal delay={0.1}>
              <Card className="border-primary/15">
                <CardContent className="p-5">
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Globe className="size-4 text-primary" />
                    Provider Lainnya
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Provider {item.region === "indonesia" ? "Indonesia" : "global"} lain yang juga kami riset.
                  </p>
                  <div className="mt-4 space-y-2">
                    {related.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Tidak ada provider lain pada region ini.
                      </p>
                    ) : (
                      related.map((c) => (
                        <Link
                          key={c.id}
                          href={`/providers/${c.slug}`}
                          className="group flex items-center gap-3 rounded-xl border border-border/60 p-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.03]"
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-lg shadow-sm"
                            aria-hidden
                          >
                            {c.logo || "🌐"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                              {c.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <Stars rating={c.rating} size="size-3" />
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ))
                    )}
                  </div>
                  <Separator className="my-4" />
                  <Link href="/compare">
                    <Button type="button" variant="outline" className="w-full">
                      Lihat Semua Provider
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/60 transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-bold text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// Wrap useParams so we don't import next/navigation at module level into a
// component that's used in both the layout wrapper and the inner component.
function useParamsSlug(): string {
  const params = useParams<{ slug: string }>();
  return (params?.slug as string) ?? "";
}
