"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Globe, ShoppingCart, Check, X, ArrowRight, RefreshCw, Sparkles,
  ShieldCheck, Zap, BadgeCheck, Loader2, TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal, formatRupiah } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

interface CheckResult {
  ok: boolean;
  domain: string;
  sld: string;
  tld: string;
  available: boolean;
  price: number;
  promo: number | null;
  currency: string;
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
  active: boolean;
}

const ALT_TLDS = [".id", ".web.id", ".xyz", ".online", ".store", ".co.id"];
const CATS = [
  { id: "popular", label: "Populer" },
  { id: "geo", label: "Geo Indonesia" },
  { id: "business", label: "Bisnis" },
  { id: "tech", label: "Teknologi" },
  { id: "sale", label: "Diskon" },
];

export default function DomainPage() {
  return (
    <MarketingLayout>
      <Hero />
      <TldPricingTable />
      <TransferSection />
      <CtaBand />
    </MarketingLayout>
  );
}

function Hero() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [alternatives, setAlternatives] = useState<CheckResult[]>([]);
  const [searched, setSearched] = useState<string>("");
  const addItem = useCart((s) => s.addItem);

  const checkDomain = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiFetch(`/domains/check?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error("Gagal cek domain");
      return (await res.json()) as CheckResult;
    },
    onSuccess: (data) => setResult(data),
    onError: () => toast.error("Gagal mengecek domain. Coba lagi."),
  });

  const checkAltMutation = useMutation({
    mutationFn: async (sld: string) => {
      const results = await Promise.all(
        ALT_TLDS.map(async (tld) => {
          try {
            const res = await apiFetch(`/domains/check?domain=${encodeURIComponent(sld + tld)}`);
            if (!res.ok) return null;
            return (await res.json()) as CheckResult;
          } catch {
            return null;
          }
        }),
      );
      return results.filter((r): r is CheckResult => !!r);
    },
    onSuccess: (data) => setAlternatives(data),
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (!q.includes(".")) {
      toast.info("Tambahkan ekstensi domain, contoh: namabisnis.com");
      return;
    }
    setSearched(q);
    setResult(null);
    setAlternatives([]);
    checkDomain.mutate(q);
    const firstDot = q.indexOf(".");
    const sld = firstDot > 0 ? q.slice(0, firstDot) : q;
    checkAltMutation.mutate(sld);
  };

  const addToCart = (r: CheckResult) => {
    if (!r.available) return;
    addItem({
      type: "domain",
      name: `Domain ${r.domain}`,
      domain: r.domain,
      period: 1,
      billingCycle: "yearly",
      price: r.promo ?? r.price,
      qty: 1,
    });
    toast.success(`${r.domain} ditambahkan ke keranjang`);
  };

  return (
    <section id="top" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary">
            <Globe className="mr-1 size-3" /> Domain Murah Indonesia
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Cari & Daftar <span className="gradient-text">Domain</span> Impianmu
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Ratusan ekstensi domain dengan harga termurah. Cek ketersediaan, dapatkan promo, dan langsung
            punya domain dalam hitungan menit.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto mt-10 max-w-2xl">
          <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="namabisnis.com"
                className="h-14 pl-12 text-base shadow-lg"
                aria-label="Cari domain"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={checkDomain.isPending}
              className="h-14 bg-brand-gradient px-8 text-primary-foreground shadow-lg"
            >
              {checkDomain.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Mengecek...
                </>
              ) : (
                <>
                  <Search className="size-4" /> Cek Domain
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground">Promo domain:</span>
            {[".com", ".id", ".web.id", ".xyz", ".online"].map((tld) => (
              <button
                key={tld}
                type="button"
                onClick={() => setQuery(`namabisnis${tld}`)}
                className="rounded-full border border-border bg-background px-3 py-1 font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5"
              >
                {tld}
              </button>
            ))}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border border-border bg-card p-5 shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{result.domain}</span>
                    {result.available ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="mr-1 size-3" /> Tersedia
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <X className="mr-1 size-3" /> Dipakai
                      </Badge>
                    )}
                    {result.promo && (
                      <Badge className="bg-gold/15 text-gold-foreground">
                        <TrendingDown className="mr-1 size-3" /> Promo
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {result.available ? (
                      <>
                        Hanya{" "}
                        <span className="font-bold text-foreground">
                          {formatRupiah(result.promo ?? result.price)}
                        </span>
                        /tahun
                        {result.promo && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">
                            {formatRupiah(result.price)}
                          </span>
                        )}
                      </>
                    ) : (
                      "Domain sudah dipakai. Coba variasi nama lain di bawah."
                    )}
                  </p>
                </div>
                {result.available && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={() => addToCart(result)} className="bg-brand-gradient text-primary-foreground">
                      <ShoppingCart className="size-4" /> Tambah ke Keranjang
                    </Button>
                    <Link href="/cart">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Lihat Keranjang <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {searched && (checkAltMutation.isPending || alternatives.length > 0) && (
            <div className="mt-6 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Cek domain lain yang serupa</h3>
                {checkAltMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {alternatives.map((alt) => (
                  <div
                    key={alt.domain}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {alt.available ? (
                        <BadgeCheck className="size-4 text-emerald-500" />
                      ) : (
                        <X className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-semibold">{alt.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {alt.available ? (
                        <>
                          <span className="text-xs font-bold text-foreground">
                            {formatRupiah(alt.promo ?? alt.price)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addToCart(alt)}
                            className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                          >
                            + Keranjang
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Dipakai</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function TldPricingTable() {
  const { data, isLoading } = useQuery<{ ok: boolean; items: TldItem[] }>({
    queryKey: ["tlds"],
    queryFn: async () => {
      const res = await apiFetch("/domains/tlds");
      if (!res.ok) throw new Error("Gagal memuat TLD");
      return res.json();
    },
  });

  const items = data?.items ?? [];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-gold/20 bg-gold/10 text-gold-foreground">Daftar Harga TLD</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Bandingkan <span className="gradient-text">Harga Domain</span> Semua Ekstensi
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pilih ekstensi domain yang sesuai dengan bisnis Anda. Harga sudah termasuk biaya administrasi.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <Tabs defaultValue="popular" className="w-full">
            <div className="flex justify-center">
              <TabsList className="flex h-auto flex-wrap gap-1 bg-card p-1.5">
                {CATS.map((c) => (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="data-[state=active]:bg-brand-gradient data-[state=active]:text-primary-foreground"
                  >
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {CATS.map((c) => {
              const filtered = items.filter((t) => {
                if (c.id === "sale") return t.promo;
                return t.category === c.id;
              });
              return (
                <TabsContent key={c.id} value={c.id} className="mt-6">
                  <Card className="overflow-hidden border-border shadow-sm">
                    <CardContent className="p-0">
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
                          {!isLoading && filtered.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                Belum ada TLD pada kategori ini.
                              </TableCell>
                            </TableRow>
                          )}
                          {!isLoading &&
                            filtered.map((t) => (
                              <TableRow key={t.id}>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-foreground">{t.tld}</span>
                                    {t.popular && (
                                      <Badge className="bg-primary/15 text-primary">Populer</Badge>
                                    )}
                                    {t.promo && (
                                      <Badge className="bg-gold/15 text-gold-foreground">Promo</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right">
                                  {t.promo && t.promoPrice > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="font-bold text-foreground">
                                        {formatRupiah(t.promoPrice)}
                                      </span>
                                      <span className="text-xs text-muted-foreground line-through">
                                        {formatRupiah(t.register)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold text-foreground">{formatRupiah(t.register)}</span>
                                  )}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right text-muted-foreground">
                                  {formatRupiah(t.transfer)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right text-muted-foreground">
                                  {formatRupiah(t.renew)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}

function TransferSection() {
  const steps = [
    {
      icon: RefreshCw,
      title: "Ajukan Transfer",
      desc: "Buka halaman transfer domain, masukkan nama domain yang ingin dipindahkan, dan dapatkan kode EPP.",
    },
    {
      icon: ShieldCheck,
      title: "Verifikasi Kepemilikan",
      desc: "Konfirmasi transfer melalui email yang dikirim ke kontak admin domain lama Anda. Proses aman & cepat.",
    },
    {
      icon: Zap,
      title: "Domain Aktif di JuraganWebsite",
      desc: "Setelah transfer disetujui, domain akan aktif di akun JuraganWebsite. Perpanjangan 1 tahun otomatis.",
    },
  ];
  return (
    <section className="border-y border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">Pindah Domain</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Transfer Domain ke <span className="gradient-text">JuraganWebsite</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pindahkan domain Anda dari registrar lain dengan mudah, gratis, dan dapat perpanjangan 1 tahun.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <Card className="h-full border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-md">
                    <s.icon className="size-6" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">Langkah {i + 1}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/contact">
            <Button size="lg" className="bg-brand-gradient text-primary-foreground shadow-md">
              Ajukan Transfer Domain <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
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
              Siap Punya Domain Sendiri?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Cek ketersediaan sekarang dan dapatkan harga promo domain terbaik di Indonesia.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#top">
                <Button size="lg" variant="secondary" className="shadow-md">
                  <Search className="size-4" /> Cek Domain Sekarang
                </Button>
              </a>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Lihat Semua Harga <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
