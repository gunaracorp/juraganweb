"use client";

import Link from "next/link";
import {
  Zap,
  MousePointerClick,
  GitBranch,
  ShieldCheck,
  TerminalSquare,
  DatabaseBackup,
  ArrowRight,
  Sparkles,
  Gauge,
  Rocket,
  BookOpen,
  Clock,
  Palette,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { PricingTable } from "@/components/site/pricing-table";
import { Reveal } from "@/components/site/ui-helpers";

const FEATURES = [
  {
    icon: Zap,
    title: "LiteSpeed Cache",
    desc: "Server LiteSpeed + LSCache plugin memberikan performa 50x lebih cepat dibanding Apache biasa.",
  },
  {
    icon: MousePointerClick,
    title: "1-Click WordPress Install",
    desc: "Instal WordPress dengan satu klik. Tersedia juga plugin populer: Elementor, WooCommerce, Yoast, dll.",
  },
  {
    icon: GitBranch,
    title: "Staging Environment",
    desc: "Buat staging site untuk uji perubahan tanpa mengganggu produksi. Push ke live dengan satu klik.",
  },
  {
    icon: ShieldCheck,
    title: "Auto SSL",
    desc: "SSL Let's Encrypt terpasang otomatis saat domain ditambahkan, diperbarui otomatis tanpa intervensi.",
  },
  {
    icon: TerminalSquare,
    title: "WP-CLI Tersedia",
    desc: "Akses WP-CLI untuk manajemen WordPress via command line. Lebih cepat untuk migrasi dan update bulk.",
  },
  {
    icon: DatabaseBackup,
    title: "Backup Harian",
    desc: "Backup otomatis harian dengan retention 30 hari. Restore point-in-time tersedia untuk situasi darurat.",
  },
];

const WHY_US = [
  {
    icon: Gauge,
    title: "Performa Teruji",
    desc: "Skor PageSpeed 90+ karena kombinasi LiteSpeed, NVMe, HTTP/3, dan caching tingkat lanjut.",
  },
  {
    icon: Rocket,
    title: "Skalabilitas Mudah",
    desc: "Upgrade paket hanya butuh satu klik tanpa migrasi data. Performa naik saat traffic tumbuh.",
  },
  {
    icon: ShieldCheck,
    title: "Keamanan Berlapis",
    desc: "Firewall WAF, malware scanning harian, dan auto SSL menjaga WordPress Anda dari serangan.",
  },
  {
    icon: BookOpen,
    title: "Dukungan Pakar WP",
    desc: "Tim support tersertifikasi WordPress siap membantu masalah teknis plugin, tema, dan performa.",
  },
  {
    icon: Clock,
    title: "Update Otomatis",
    desc: "WordPress core, plugin, dan tema dapat di-update otomatis dengan rollback satu klik bila perlu.",
  },
  {
    icon: Palette,
    title: "Tema & Plugin Gratis",
    desc: "Akses pustaka tema premium dan plugin populer untuk membangun website profesional.",
  },
];

const FAQS = [
  {
    q: "Apakah bisa migrasi WordPress dari provider lain?",
    a: "Ya. Tim kami melakukan migrasi WordPress gratis dari provider mana pun. Cukup berikan akses lama, dan kami akan memindahkan file, database, dan konfigurasi tanpa downtime. Proses umumnya selesai dalam 24 jam.",
  },
  {
    q: "Apakah hosting ini cocok untuk WooCommerce?",
    a: "Sangat cocok. Paket WordPress Hosting kami dioptimasi untuk WooCommerce dengan cache yang kompatibel cart/checkout, auto SSL, dan performa tinggi. Paket Business mendukung hingga 500k kunjungan/bulan.",
  },
  {
    q: "Apakah staging termasuk gratis?",
    a: "Ya. Semua paket WordPress Hosting dilengkapi staging environment tanpa biaya tambahan. Anda dapat membuat, mengedit, dan push staging ke live melalui panel cPanel dengan mudah.",
  },
  {
    q: "Apakah ada batas jumlah plugin yang dipasang?",
    a: "Tidak ada batas kaku. Namun, untuk performa optimal kami menyarankan menggunakan plugin secukupnya dan menghindari plugin yang berat. Tim support kami siap membantu audit performa website Anda.",
  },
  {
    q: "Bagaimana dengan keamanan WordPress?",
    a: "Kami menyediakan firewall WAF, malware scanning otomatis harian, auto SSL, dan patch keamanan server real-time. Selain itu, fitur login two-factor dan limit login attempts aktif secara default.",
  },
];

export default function WordPressPage() {
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
                <Sparkles className="size-3.5" /> WordPress Hosting
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                WordPress Hosting{" "}
                <span className="gradient-text">Dioptimasi LiteSpeed</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Performa maksimal untuk website WordPress Anda. LiteSpeed
                Enterprise, LSCache, auto SSL, staging, dan backup harian dalam
                satu paket terkelola.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#pricing">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90 sm:w-auto"
                  >
                    Lihat Paket WordPress <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#why">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Mengapa Kami
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" /> LiteSpeed + LSCache
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MousePointerClick className="size-3.5 text-primary" /> 1-click
                  install
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GitBranch className="size-3.5 text-primary" /> Staging
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Auto SSL
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingTable
        category="wordpress"
        title="Pilih Paket WordPress Hosting"
        subtitle="Optimasi khusus WordPress dengan staging dan backup. Bayar bulanan atau hemat hingga 17% tahunan."
      />

      {/* FEATURES */}
      <section
        id="features"
        className="relative bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Keunggulan WP Hosting
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Semua yang WordPress Butuhkan
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Server dioptimasi khusus WordPress dengan tool pengembangan
              profesional.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05} className="h-full">
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                      <f.icon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Mengapa WordPress di JuraganWebsite
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Lebih dari Sekadar Hosting WordPress
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Platform terkelola dengan dukungan ahli WordPress sejak 2007.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05} className="h-full">
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                      <f.icon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              FAQ
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Pertanyaan yang Sering Diajukan
            </h2>
          </Reveal>
          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center shadow-xl sm:p-12">
              <div className="pointer-events-none absolute inset-0 bg-mesh opacity-20" />
              <div className="relative">
                <h2 className="text-balance text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
                  Pindahkan WordPress Anda ke sini.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
                  Migrasi gratis, garansi 30 hari uang kembali, performa 50x
                  lebih cepat.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a href="#pricing">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-background text-foreground shadow-md hover:bg-background/90 sm:w-auto"
                    >
                      <Rocket className="size-4" /> Mulai Sekarang
                    </Button>
                  </a>
                  <Link href="/hosting">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                    >
                      Lihat Shared Hosting <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
