"use client";

import Link from "next/link";
import {
  Gauge,
  ShieldCheck,
  Settings2,
  DatabaseBackup,
  Scale,
  Headphones,
  ArrowRight,
  Sparkles,
  Cloud,
  Server,
  Boxes,
  Zap,
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
    icon: Gauge,
    title: "Auto-Scaling",
    desc: "Resource otomatis bertambah saat traffic melonjak dan kembali normal saat traffic turun. Bayar sesuai pakai.",
  },
  {
    icon: ShieldCheck,
    title: "99.99% SLA Uptime",
    desc: "Garansi uptime 99.99% dengan kompensasi otomatis jika tidak terpenuhi. Infrastruktur high availability.",
  },
  {
    icon: Settings2,
    title: "Fully Managed",
    desc: "Tim kami mengurus maintenance, security patching, dan optimasi server. Anda fokus pada bisnis.",
  },
  {
    icon: DatabaseBackup,
    title: "Daily Backup",
    desc: "Backup otomatis setiap hari dengan retention 30 hari. Restore point-in-time tersedia.",
  },
  {
    icon: Scale,
    title: "Load Balancer",
    desc: "Trafik didistribusikan ke beberapa node aktif untuk performa stabil dan zero downtime.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    desc: "Akses prioritas ke teknisi senior via Live Chat dan tiket. Respons < 5 menit.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: Cloud,
    title: "Traffic Masuk",
    desc: "Pengunjung mengakses website Anda melalui Load Balancer yang mendistribusikan trafik ke node sehat.",
  },
  {
    icon: Boxes,
    title: "Auto-Scaling",
    desc: "Sistem memantau beban dan otomatis menambah/mengurangi kapasitas sesuai kebutuhan secara real-time.",
  },
  {
    icon: Zap,
    title: "Website Cepat & Stabil",
    desc: "Pengunjung mendapat respons cepat dari node terdekat, bahkan saat traffic meningkat drastis.",
  },
];

const FAQS = [
  {
    q: "Apa beda Cloud Hosting dengan Shared Hosting?",
    a: "Cloud Hosting menggunakan banyak node server yang saling terhubung dengan auto-scaling dan load balancer, sehingga tidak ada single point of failure. Shared Hosting hanya menggunakan satu server dengan resource yang dibagi pengguna lain.",
  },
  {
    q: "Apakah Cloud Hosting fully managed?",
    a: "Ya. Semua paket Cloud Hosting kami fully managed. Tim kami mengurus konfigurasi server, security patching, optimasi, monitoring 24/7, dan backup. Anda fokus mengembangkan bisnis tanpa pusing urusan server.",
  },
  {
    q: "Bagaimana cara auto-scaling bekerja?",
    a: "Sistem memantau beban server secara real-time. Jika CPU atau RAM mendekati batas tertentu, resource otomatis ditambah untuk menjaga performa. Saat traffic turut kembali normal, resource dilepas dan biaya menyesuaikan.",
  },
  {
    q: "Apakah ada SLA uptime?",
    a: "Ya. Kami memberikan SLA 99.99% uptime. Jika uptime bulanan di bawah 99.99%, Anda berhak menerima kompensasi kredit otomatis sesuai ketentuan SLA yang berlaku.",
  },
];

export default function CloudPage() {
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
                <Cloud className="size-3.5" /> Cloud Hosting Managed
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Cloud Hosting dengan{" "}
                <span className="gradient-text">Auto-Scaling</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Infrastruktur cloud terkelola dengan auto-scaling, load
                balancer, dan SLA uptime 99.99%. Skalabilitas tanpa batas untuk
                website dan aplikasi traffic tinggi.
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
                    Lihat Paket Cloud <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#how">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Cara Kerja Cloud
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Gauge className="size-3.5 text-primary" /> Auto-scaling
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> 99.99% SLA
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Settings2 className="size-3.5 text-primary" /> Fully managed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Scale className="size-3.5 text-primary" /> Load balancer
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingTable
        category="cloud"
        title="Pilih Paket Cloud Hosting"
        subtitle="Skalabilitas cloud dengan harga predictable. Bayar bulanan atau hemat hingga 14% dengan paket tahunan."
      />

      {/* FEATURES */}
      <section
        id="features"
        className="relative bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Keunggulan Cloud
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Cloud yang Tumbuh Bersama Bisnis
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Tidak perlu pusing mikir kapasitas server. Cloud auto-scaling
              menyesuaikan otomatis.
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

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Cara Kerja Cloud
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Bagaimana Cloud Hosting Bekerja
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Tiga langkah sederhana untuk performa cloud yang konsisten.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="relative">
                <Card className="relative h-full overflow-hidden border-primary/20">
                  <CardContent className="flex h-full flex-col items-center p-8 text-center">
                    <span className="absolute right-4 top-3 text-5xl font-extrabold text-primary/10">
                      {i + 1}
                    </span>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg">
                      <step.icon className="size-8" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-primary md:block">
                    <ArrowRight className="size-6" />
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              <Server className="mr-1.5 inline size-4 text-primary" />
              Infrastruktur multi-node dengan failover otomatis dan zero
              downtime maintenance.
            </p>
          </Reveal>
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
                  Siap pindah ke infrastruktur cloud?
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
                  Tim kami siap membantu migrasi gratis dari provider lama Anda.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a href="#pricing">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-background text-foreground shadow-md hover:bg-background/90 sm:w-auto"
                    >
                      <Sparkles className="size-4" /> Pilih Paket Cloud
                    </Button>
                  </a>
                  <Link href="/vps">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                    >
                      Butuh root? Lihat VPS <ArrowRight className="size-4" />
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
