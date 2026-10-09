"use client";

import Link from "next/link";
import {
  MousePointerClick, LayoutTemplate, Smartphone, Search, ShoppingBag, Server,
  ArrowRight, Check, Zap, Sparkles, Code2, Rocket, Eye, Palette, Wand2, Star,
  Briefcase, Utensils, PenLine,
} from "lucide-react";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "1. Pilih Template",
    desc: "Jelajahi 200+ template siap pakai yang dirancang untuk berbagai industri. Pilih satu yang sesuai dengan bisnis Anda.",
  },
  {
    icon: Palette,
    title: "2. Customize",
    desc: "Ubah teks, gambar, warna, dan layout dengan mudah menggunakan editor drag & drop. Tanpa coding sama sekali.",
  },
  {
    icon: Rocket,
    title: "3. Publish",
    desc: "Klik Publish dan website Anda langsung online. Gratis hosting, SSL, dan domain sub-JuraganWebsite.",
  },
];

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Drag & Drop Editor",
    desc: "Susun halaman website dengan mudah — cukup seret dan lepas elemen. Live preview setiap saat.",
  },
  {
    icon: LayoutTemplate,
    title: "200+ Template",
    desc: "Koleksi template profesional yang dirancang untuk berbagai industri: bisnis, toko online, restoran, blog, dan lainnya.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    desc: "Semua template otomatis tampil sempurna di mobile, tablet, dan desktop. Tidak perlu setting tambahan.",
  },
  {
    icon: Search,
    title: "SEO Ready",
    desc: "Struktur halaman SEO-friendly, meta tag otomatis, sitemap.xml, dan schema markup sudah diaktifkan.",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Ready",
    desc: "Aktifkan toko online dalam klik. Kelola produk, pembayaran, dan pengiriman dari satu dashboard.",
  },
  {
    icon: Server,
    title: "Free Hosting",
    desc: "Hosting cepat dengan SSD, SSL gratis, dan CDN global sudah termasuk. Tanpa biaya tambahan.",
  },
];

const TEMPLATES = [
  { name: "Business", desc: "Company profile profesional", grad: "from-violet-500 via-purple-500 to-fuchsia-500", icon: Briefcase },
  { name: "Portfolio", desc: "Tampilkan karya kreatifmu", grad: "from-rose-500 via-pink-500 to-orange-400", icon: Palette },
  { name: "Toko Online", desc: "Jual produk dengan mudah", grad: "from-amber-500 via-orange-500 to-rose-500", icon: ShoppingBag },
  { name: "Restoran", desc: "Menu, pemesanan, & galeri", grad: "from-emerald-500 via-teal-500 to-cyan-500", icon: Utensils },
  { name: "Blog", desc: "Tulis & publish artikel", grad: "from-fuchsia-500 via-purple-500 to-violet-500", icon: PenLine },
  { name: "Landing Page", desc: "Konversi lebih tinggi", grad: "from-teal-500 via-emerald-500 to-lime-400", icon: Rocket },
];

const FAQS = [
  {
    q: "Apakah saya perlu keahlian coding?",
    a: "Tidak sama sekali. Website Builder JuraganWebsite dirancang khusus untuk pemula. Cukup pilih template, customize dengan drag & drop, lalu publish. Semua orang bisa membuat website profesional dalam hitungan menit.",
  },
  {
    q: "Apakah hosting dan domain sudah termasuk?",
    a: "Ya! Setiap website yang Anda buat sudah termasuk hosting gratis, SSL gratis, dan subdomain JuraganWebsite (contoh: tokoanda.juraganwebsite.web.id). Anda juga bisa hubungkan domain sendiri kapan saja.",
  },
  {
    q: "Bisakah saya membuat toko online?",
    a: "Tentu. Aktifkan fitur E-commerce, tambahkan produk, atur metode pembayaran (transfer bank, e-wallet, QRIS), dan website Anda siap menerima pesanan. Tersedia juga fitur manajemen stok dan pengiriman.",
  },
  {
    q: "Apakah website saya akan SEO friendly?",
    a: "Ya. Semua template dirancang dengan struktur SEO-friendly, dilengkapi meta tag otomatis, sitemap.xml, schema markup, dan integrasi Google Search Console. Website Anda siap tampil di halaman pertama Google.",
  },
  {
    q: "Bisakah saya pindahkan website ke hosting lain?",
    a: "Anda bisa export konten website kapan saja. Namun untuk performa terbaik, sebaiknya tetap hosting di JuraganWebsite agar fitur premium seperti CDN dan caching tetap aktif.",
  },
  {
    q: "Berapa lama waktu yang dibutuhkan untuk membuat website?",
    a: "Rata-rata pengguna kami bisa membuat website profesional dalam 30 menit hingga 2 jam, tergantung tingkat kustomisasi yang diinginkan. Tanpa perlu menunggu developer atau jasa mahal.",
  },
];

export default function WebsiteBuilderPage() {
  return (
    <MarketingLayout>
      <Hero />
      <Steps />
      <Features />
      <TemplateShowcase />
      <PricingCta />
      <Faq />
      <FinalCta />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="text-center lg:text-left">
            <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary">
              <Wand2 className="mr-1 size-3" /> Website Builder
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Bangun Website <span className="gradient-text">Tanpa Coding</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">
              Drag & drop 200+ template profesional, langsung online dalam menit. Gratis hosting, SSL,
              dan subdomain. Cocok untuk UMKM, portfolio, toko online, dan company profile.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="bg-brand-gradient text-primary-foreground shadow-lg">
                  <Rocket className="size-4" /> Mulai Gratis
                </Button>
              </Link>
              <Link href="#template">
                <Button size="lg" variant="outline">
                  <Eye className="size-4" /> Lihat Template
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> Tanpa kartu kredit</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> 200+ template</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> Hosting gratis</div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <span className="size-3 rounded-full bg-rose-400" />
                  <span className="size-3 rounded-full bg-amber-400" />
                  <span className="size-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-medium text-muted-foreground">juraganwebsite.builder</span>
                </div>
                <div className="space-y-3 p-5">
                  <div className="rounded-lg bg-brand-gradient p-4 text-primary-foreground">
                    <div className="text-xs uppercase tracking-wide opacity-80">Header</div>
                    <div className="mt-1 text-lg font-bold">Nama Bisnis Anda</div>
                    <div className="text-xs opacity-90">Tagline menarik di sini</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-md border border-border bg-background p-2 text-center">
                        <div className="mx-auto h-8 w-8 rounded-full bg-primary/15" />
                        <div className="mt-1.5 h-1.5 w-full rounded bg-muted" />
                        <div className="mt-1 h-1.5 w-2/3 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-xs text-primary">
                    + Tarik elemen ke sini
                  </div>
                  <div className="rounded-md bg-muted/60 p-4 text-center">
                    <div className="mx-auto h-2 w-1/2 rounded bg-muted-foreground/30" />
                    <div className="mt-2 h-2 w-2/3 rounded bg-muted-foreground/20" />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-4 -top-4 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground shadow-lg">
                <Sparkles className="size-3" /> Live Preview
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="border-y border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">Cara Kerja</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tiga Langkah Sederhana, <span className="gradient-text">Website Langsung Online</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dari nol sampai online dalam hitungan menit. Benar-benar tanpa coding.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <Card className="group relative h-full overflow-hidden border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                    <s.icon className="size-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-primary/40 sm:block" />
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-gold/20 bg-gold/10 text-gold-foreground">Fitur Unggulan</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Semua yang Anda Butuhkan untuk <span className="gradient-text">Website Profesional</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fitur lengkap yang biasanya hanya tersedia di platform berbayar mahal. Di sini, semua gratis.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.08, 0.4)}>
              <Card className="h-full border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{f.title}</h3>
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

function TemplateShowcase() {
  return (
    <section id="template" className="border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">Showcase</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            200+ Template <span className="gradient-text">Siap Pakai</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pilih template favorit Anda, customize, dan langsung publish. Semua template mobile responsive & SEO friendly.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t, i) => (
            <Reveal key={t.name} delay={Math.min(i * 0.08, 0.4)}>
              <Card className="group h-full overflow-hidden border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-0">
                  <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${t.grad}`}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <t.icon className="size-10 drop-shadow" />
                      <span className="mt-2 text-sm font-bold uppercase tracking-wide drop-shadow">{t.name}</span>
                    </div>
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-white/40" />
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                    <Link href="/register" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      Gunakan template <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
          <Link href="/register">
            <Button size="lg" variant="outline">
              Lihat Semua 200+ Template <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function PricingCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 shadow-xl sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-gold/20 blur-3xl" />
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <div>
                <Badge className="mb-4 border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground">
                  <Zap className="mr-1 size-3" /> Gratis Selamanya
                </Badge>
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
                  Mulai Bangun Website Gratis
                </h2>
                <p className="mt-3 text-primary-foreground/90">
                  Tanpa kartu kredit. Tanpa biaya setup. Tanpa batas waktu. Upgrade kapan saja untuk fitur premium.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="shadow-md">
                      <Rocket className="size-4" /> Daftar Sekarang
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      Hubungi Sales
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Server, label: "Hosting Gratis" },
                  { icon: Zap, label: "SSL Gratis" },
                  { icon: Code2, label: "Tanpa Coding" },
                  { icon: Star, label: "200+ Template" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl bg-white/10 p-4 text-primary-foreground backdrop-blur-sm">
                    <Icon className="size-5" />
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">FAQ</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pertanyaan Seputar Website Builder
          </h2>
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

function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Siap Bangun Website <span className="gradient-text">Impian Anda?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Gabung dengan ribuan pemilik bisnis yang sudah membangun website mereka bersama JuraganWebsite.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-brand-gradient text-primary-foreground shadow-lg">
                <Rocket className="size-4" /> Mulai Sekarang Gratis
              </Button>
            </Link>
            <Link href="/ai-builder">
              <Button size="lg" variant="outline">
                <Wand2 className="size-4" /> Coba AI Builder
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
