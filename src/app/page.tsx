"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Server, Cloud, Globe, ShieldCheck, Mail, Zap, Check, ArrowRight,
  Database, Lock, Headphones, Rocket, Cpu, HardDrive, Gauge, Star, ShoppingCart,
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

interface DomainResult {
  ok: boolean;
  domain: string;
  available: boolean;
  price: number;
  promo: number | null;
  tld: string;
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <Hero />
      <TrustBar />
      <ProductGrid />
      <FeatureSection />
      <StatsSection />
      <TestimonialStrip />
      <FinalCTA />
    </MarketingLayout>
  );
}

function Hero() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DomainResult | null>(null);
  const addItem = useCart((s) => s.addItem);

  const checkDomain = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiFetch(`/domains/check?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error("Gagal cek domain");
      return res.json() as Promise<DomainResult>;
    },
    onSuccess: (data) => setResult(data),
    onError: () => toast.error("Gagal mengecek domain. Coba lagi."),
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (!q.includes(".")) {
      toast.info("Tambahkan ekstensi domain, contoh: namabisnis.com");
      return;
    }
    checkDomain.mutate(q);
  };

  const addToCart = () => {
    if (!result || !result.available) return;
    addItem({
      type: "domain",
      name: `Domain ${result.domain}`,
      domain: result.domain,
      period: 1,
      billingCycle: "yearly",
      price: result.promo ?? result.price,
      qty: 1,
    });
    toast.success(`${result.domain} ditambahkan ke keranjang`);
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary">
            <Zap className="mr-1 size-3" /> Hosting #1 Indonesia Sejak 2007
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Hosting, Domain & Website{" "}
            <span className="gradient-text">Profesional</span>{" "}
            dalam Satu Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Gabungan terbaik Hostinger & IDCloudHost. Shared hosting, VPS cloud, WordPress hosting, email bisnis,
            SSL, domain murah, dan website builder — semua dengan harga terjangkau & dukungan 24/7.
          </p>
        </Reveal>

        {/* Domain search */}
        <Reveal delay={0.15} className="mx-auto mt-10 max-w-2xl">
          <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari domain impianmu... misal: namabisnis.com"
                className="h-14 pl-12 text-base shadow-lg"
              />
            </div>
            <Button type="submit" size="lg" disabled={checkDomain.isPending}
              className="h-14 bg-brand-gradient px-8 text-primary-foreground shadow-lg">
              {checkDomain.isPending ? "Mengecek..." : "Cek Domain"}
            </Button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-border bg-card p-4 shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{result.domain}</span>
                    {result.available ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600">Tersedia</Badge>
                    ) : (
                      <Badge variant="destructive">Dipakai</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                      "Domain sudah dipakai. Coba variasi nama lain."
                    )}
                  </p>
                </div>
                {result.available && (
                  <Button onClick={addToCart} className="bg-brand-gradient text-primary-foreground">
                    <ShoppingCart className="size-4" /> Tambah ke Keranjang
                  </Button>
                )}
              </div>
            </motion.div>
          )}

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
        </Reveal>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "SSL Gratis Selamanya" },
    { icon: Gauge, label: "Uptime 99.99%" },
    { icon: Headphones, label: "Support 24/7" },
    { icon: Database, label: "Backup Harian" },
    { icon: Lock, label: "Garansi 30 Hari" },
    { icon: Rocket, label: "LiteSpeed Cache" },
  ];
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon className="size-4 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}

const PRODUCTS = [
  { href: "/hosting", icon: Server, title: "Shared Hosting", desc: "Hosting murah untuk blog, portofolio, & UMKM.", price: "Rp 14.900/bln", color: "from-violet-500/15 to-violet-500/5" },
  { href: "/wordpress", icon: Rocket, title: "WordPress Hosting", desc: "Dioptimasi untuk WordPress dengan LiteSpeed.", price: "Rp 29.900/bln", color: "from-rose-500/15 to-rose-500/5" },
  { href: "/vps", icon: Cpu, title: "VPS Cloud Server", desc: "VPS KVM dengan NVMe & full root access.", price: "Rp 99.000/bln", color: "from-amber-500/15 to-amber-500/5" },
  { href: "/cloud", icon: Cloud, title: "Cloud Hosting", desc: "Auto-scaling, high availability, managed.", price: "Rp 149.000/bln", color: "from-teal-500/15 to-teal-500/5" },
  { href: "/email", icon: Mail, title: "Email Bisnis", desc: "Email profesional dengan domain sendiri.", price: "Rp 19.900/bln", color: "from-cyan-500/15 to-cyan-500/5" },
  { href: "/ssl", icon: ShieldCheck, title: "SSL Certificate", desc: "Enkripsi 256-bit, terbit dalam menit.", price: "Rp 29.000/thn", color: "from-emerald-500/15 to-emerald-500/5" },
  { href: "/domain", icon: Globe, title: "Domain", desc: "Puluhan TLD dengan harga termurah.", price: "Mulai Rp 19.000", color: "from-fuchsia-500/15 to-fuchsia-500/5" },
  { href: "/website-builder", icon: Zap, title: "Website Builder", desc: "Bangun website tanpa coding.", price: "Gratis", color: "from-indigo-500/15 to-indigo-500/5" },
];

function ProductGrid() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Produk Kami
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Semua yang Kamu Butuhkan untuk Online
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Dari hosting hingga website builder, dari domain hingga SSL — satu platform lengkap.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.href} delay={i * 0.05}>
              <Link href={p.href}>
                <Card className={`group h-full overflow-hidden border-border bg-gradient-to-br ${p.color} transition-all hover:-translate-y-1 hover:shadow-lg`}>
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/70 text-primary shadow-sm">
                      <p.icon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">{p.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{p.price}</span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  const features = [
    { icon: Gauge, title: "Performa Tinggi", desc: "LiteSpeed Web Server, NVMe SSD, dan HTTP/3 untuk loading tercepat." },
    { icon: ShieldCheck, title: "Keamanan Berlapis", desc: "Firewall, anti-DDoS, malware scanner, dan SSL gratis untuk semua paket." },
    { icon: Headphones, title: "Dukungan 24/7", desc: "Tim ahli Indonesia siap membantu via chat, ticket, dan WhatsApp kapan saja." },
    { icon: Database, title: "Backup Otomatis", desc: "Cadangkan data harian dengan restore 1-klik untuk ketenangan pikiran." },
    { icon: Lock, title: "Garansi Uang Kembali", desc: "Tidak puas? Uang kembali 30 hari, tanpa pertanyaan." },
    { icon: Rocket, title: "Instalasi 1-Klik", desc: "WordPress, Joomla, dan 400+ aplikasi lainnya lewat Softaculous." },
  ];
  return (
    <section className="py-20 sm:py-24 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Kenapa JuraganWebsite
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Teknologi Terbaik, Harga Terjangkau
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <Card className="h-full border-border">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "17+", label: "Tahun Pengalaman" },
    { value: "50rb+", label: "Klien Aktif" },
    { value: "99.99%", label: "Uptime Server" },
    { value: "24/7", label: "Dukungan Support" },
  ];
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-gradient p-8 text-primary-foreground shadow-xl sm:p-12">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold sm:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm font-medium opacity-90">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialStrip() {
  const items = [
    { name: "Budi Hartono", company: "Kopi Maju Indonesia", text: "Hosting JuraganWebsite sangat cepat dan stabil. Penjualan online naik 300% dalam 6 bulan.", rating: 5 },
    { name: "Sarah Kusuma", company: "Bumi Property", text: "Domain & SSL murah, support responsif. Recommended banget untuk bisnis online.", rating: 5 },
    { name: "Dr. Andi Wijaya", company: "Sehat App", text: "VPS cloud mereka reliable untuk aplikasi kami yang melayani puluhan ribu pasien.", rating: 5 },
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Testimoni Klien
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Dipercaya Ribuan Bisnis Indonesia
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-foreground/90">"{t.text}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground">
                      {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center shadow-lg sm:p-16">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-60" />
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Siap Memulai Perjalanan Digitalmu?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Mulai dari Rp 14.900/bulan. Garansi 30 hari uang kembali. Setup instan dalam hitungan menit.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/hosting">
                <Button size="lg" className="bg-brand-gradient px-8 text-primary-foreground shadow-lg">
                  Lihat Paket Hosting <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/domain">
                <Button size="lg" variant="outline">Cari Domain</Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="size-3 text-emerald-500" /> Tanpa biaya setup</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-emerald-500" /> Migrasi gratis</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-emerald-500" /> Domain gratis 1 tahun</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
