"use client";

import Link from "next/link";
import {
  Zap,
  LayoutDashboard,
  ShieldCheck,
  DatabaseBackup,
  Activity,
  Plane,
  ArrowRight,
  Sparkles,
  Server,
  Globe,
  Clock,
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
    title: "LiteSpeed Web Server",
    desc: "Server LiteSpeed Enterprise hingga 50x lebih cepat dari Apache untuk loading instan.",
  },
  {
    icon: LayoutDashboard,
    title: "cPanel Lengkap",
    desc: "Kelola website, email, database, dan file dengan kontrol panel cPanel yang familiar.",
  },
  {
    icon: ShieldCheck,
    title: "SSL Gratis Selamanya",
    desc: "Sertifikat SSL Let's Encrypt terpasang otomatis dan diperbarui tanpa biaya tambahan.",
  },
  {
    icon: DatabaseBackup,
    title: "Backup Harian",
    desc: "Data website diamankan otomatis setiap hari dengan retention hingga 30 hari.",
  },
  {
    icon: Activity,
    title: "99.99% Uptime",
    desc: "Infrastruktur redundan dengan jaminan uptime SLA 99.99% untuk website Anda.",
  },
  {
    icon: Plane,
    title: "Migrasi Gratis",
    desc: "Tim ahli kami memindahkan website Anda dari provider lama tanpa biaya dan downtime.",
  },
];

const FAQS = [
  {
    q: "Apakah ada biaya setup?",
    a: "Tidak. Semua paket shared hosting JuraganWebsite tidak dikenakan biaya setup. Anda cukup membayar biaya langganan bulanan atau tahunan sesuai paket yang dipilih.",
  },
  {
    q: "Bisa upgrade nanti?",
    a: "Tentu. Anda dapat upgrade ke paket yang lebih tinggi kapan saja melalui Client Area. Selisih biaya akan dihitung secara prorata, dan proses upgrade berjalan tanpa downtime.",
  },
  {
    q: "Bagaimana cara migrasi website?",
    a: "Cukup buat tiket di Client Area dan tim migrasi kami akan memindahkan seluruh file, database, email, dan DNS dari provider lama Anda secara gratis. Proses umumnya selesai dalam 24 jam.",
  },
  {
    q: "Apakah ada garansi?",
    a: "Ya. Kami memberikan garansi uptime 99.99% dan garansi uang kembali 30 hari. Jika layanan tidak sesuai harapan, Anda bisa mengajukan refund penuh dalam 30 hari pertama.",
  },
  {
    q: "Apakah support 24/7?",
    a: "Tim support kami siap 24 jam penuh, 7 hari seminggu melalui Live Chat dan tiket. Teknisi berpengalaman siap membantu masalah teknis Anda kapan saja.",
  },
];

export default function HostingPage() {
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
                <Sparkles className="size-3.5" /> Hosting #1 Indonesia
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Shared Hosting{" "}
                <span className="gradient-text">Cepat & Andal</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Website super ngebut dengan LiteSpeed Enterprise, cPanel
                lengkap, SSL gratis, dan dukungan 24/7. Cocok untuk blog,
                portofolio, hingga toko online UMKM.
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
                    Lihat Paket <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#features">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Bandingkan Fitur
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> Setup instan
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Garansi 30
                  hari
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Server className="size-3.5 text-primary" /> Server Indonesia
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="size-3.5 text-primary" /> Domain gratis*
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingTable
        category="hosting"
        title="Pilih Paket Hosting"
        subtitle="Harga transparan, tanpa biaya tersembunyi. Bayar bulanan atau hemat hingga 17% dengan paket tahunan."
      />

      {/* FEATURES */}
      <section id="features" className="relative bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Keunggulan Hosting
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Semua yang Anda Butuhkan untuk Online
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Teknologi terkini, dukungan ahli, dan harga ramah UMKM dalam satu
              paket.
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

      {/* FAQ */}
      <section className="py-20 sm:py-24">
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
                  Sudah punya domain? Mari mulai hosting Anda sekarang.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
                  Belum punya domain? Cari domain impian Anda dengan harga
                  termurah di JuraganWebsite.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/domain">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-background text-foreground shadow-md hover:bg-background/90 sm:w-auto"
                    >
                      <Globe className="size-4" /> Cari Domain
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                    >
                      Lihat Keranjang <ArrowRight className="size-4" />
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
